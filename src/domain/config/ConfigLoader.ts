/**
 * Configuration loader for OmnyReporter
 * Loads project config from omnyreporter.config.{js,ts,mjs,cjs} or .omnyrc
 * @module domain/config/ConfigLoader
 */

import { injectable, inject } from 'inversify';
import { pathToFileURL } from 'node:url';

import { TOKENS } from '@/di/tokens.js';
import { ConfigurationError, type IFileSystem, type ILogger, type Result, ok, err } from '@core';

import { OmnyReporterConfigSchema, type OmnyReporterConfig } from '../validation/schemas/index.js';

/** Supported config file names in priority order */
const CONFIG_FILES = [
	'omnyreporter.config.ts',
	'omnyreporter.config.mts',
	'omnyreporter.config.js',
	'omnyreporter.config.mjs',
	'omnyreporter.config.cjs',
	'.omnyrc.json',
	'.omnyrc',
] as const;

/** Environment variable prefix */
const ENV_PREFIX = 'OMNY_';

/**
 * Loads and validates OmnyReporter configuration
 */
@injectable()
export class ConfigLoader {
	public constructor(
		@inject(TOKENS.FILE_SYSTEM) private readonly fileSystem: IFileSystem,
		@inject(TOKENS.LOGGER) private readonly logger: ILogger
	) {}

	/**
	 * Load configuration from project root
	 * @param rootPath Project root directory
	 * @returns Validated configuration or error
	 */
	public async load(rootPath: string): Promise<Result<OmnyReporterConfig, Error>> {
		try {
			// Try to find and load config file
			const fileConfig = await this.loadFromFile(rootPath);

			// Apply environment variable overrides
			const envOverrides = this.loadFromEnv();

			// Merge configs: defaults <- file <- env
			const mergedConfig = this.mergeConfigs(fileConfig, envOverrides);

			// Validate with Zod schema
			const parseResult = OmnyReporterConfigSchema.safeParse(mergedConfig);

			if (!parseResult.success) {
				return err(
					new ConfigurationError('Invalid configuration', {
						errors: parseResult.error.errors,
					})
				);
			}

			this.logger.debug('Configuration loaded', {
				source: fileConfig ? 'file+env' : 'env+defaults',
				sanitizationEnabled: parseResult.data.sanitization.enabled,
			});

			return ok(parseResult.data);
		} catch (error) {
			return err(
				new ConfigurationError(
					'Failed to load configuration',
					{},
					error instanceof Error ? error : new Error(String(error))
				)
			);
		}
	}

	/**
	 * Find and load config from file
	 */
	private async loadFromFile(rootPath: string): Promise<Record<string, unknown> | null> {
		for (const fileName of CONFIG_FILES) {
			const filePath = `${rootPath}/${fileName}`;
			const exists = await this.fileSystem.exists(filePath);

			if (!exists) {
				continue;
			}

			this.logger.debug(`Found config file: ${fileName}`);

			if (fileName.endsWith('.json') || fileName === '.omnyrc') {
				return this.loadJsonConfig(filePath);
			}

			return this.loadJsConfig(filePath);
		}

		this.logger.debug('No config file found, using defaults');
		return null;
	}

	/**
	 * Load JSON config file
	 */
	private async loadJsonConfig(filePath: string): Promise<Record<string, unknown>> {
		const content = await this.fileSystem.readFile(filePath);
		return JSON.parse(content) as Record<string, unknown>;
	}

	/**
	 * Load JS/TS config file using dynamic import
	 */
	private async loadJsConfig(filePath: string): Promise<Record<string, unknown>> {
		const absolutePath = this.fileSystem.resolvePath(filePath);
		const fileUrl = pathToFileURL(absolutePath).href;

		// Dynamic import for ES modules
		const module = (await import(fileUrl)) as { default?: unknown };

		if (module.default !== undefined) {
			return module.default as Record<string, unknown>;
		}

		return module as Record<string, unknown>;
	}

	/**
	 * Load configuration from environment variables
	 */
	private loadFromEnv(): Record<string, unknown> {
		const envConfig: Record<string, unknown> = {};

		// OMNY_SANITIZE=true/false
		const sanitize = process.env[`${ENV_PREFIX}SANITIZE`];
		if (sanitize !== undefined) {
			envConfig['sanitization'] = {
				enabled: sanitize === 'true' || sanitize === '1',
			};
		}

		// OMNY_SANITIZE_PATHS=true/false
		const sanitizePaths = process.env[`${ENV_PREFIX}SANITIZE_PATHS`];
		if (sanitizePaths !== undefined) {
			envConfig['sanitization'] = {
				...(envConfig['sanitization'] as Record<string, unknown> | undefined),
				paths: sanitizePaths === 'true' || sanitizePaths === '1',
			};
		}

		// OMNY_SANITIZE_MESSAGES=true/false
		const sanitizeMessages = process.env[`${ENV_PREFIX}SANITIZE_MESSAGES`];
		if (sanitizeMessages !== undefined) {
			envConfig['sanitization'] = {
				...(envConfig['sanitization'] as Record<string, unknown> | undefined),
				messages: sanitizeMessages === 'true' || sanitizeMessages === '1',
			};
		}

		// OMNY_VERBOSE=true/false
		const verbose = process.env[`${ENV_PREFIX}VERBOSE`];
		if (verbose !== undefined) {
			envConfig['verbose'] = verbose === 'true' || verbose === '1';
		}

		// OMNY_QUIET=true/false
		const quiet = process.env[`${ENV_PREFIX}QUIET`];
		if (quiet !== undefined) {
			envConfig['quiet'] = quiet === 'true' || quiet === '1';
		}

		// OMNY_OUTPUT_DIR=path
		const outputDir = process.env[`${ENV_PREFIX}OUTPUT_DIR`];
		if (outputDir !== undefined) {
			envConfig['reporting'] = {
				outputDir,
			};
		}

		return envConfig;
	}

	/**
	 * Deep merge configs with env taking precedence
	 */
	private mergeConfigs(
		fileConfig: Record<string, unknown> | null,
		envConfig: Record<string, unknown>
	): Record<string, unknown> {
		if (!fileConfig) {
			return envConfig;
		}

		return this.deepMerge(fileConfig, envConfig);
	}

	/**
	 * Deep merge two objects
	 */
	private deepMerge(
		target: Record<string, unknown>,
		source: Record<string, unknown>
	): Record<string, unknown> {
		const result = { ...target };

		for (const key of Object.keys(source)) {
			const sourceValue = source[key];
			const targetValue = result[key];

			if (this.isPlainObject(sourceValue) && this.isPlainObject(targetValue)) {
				result[key] = this.deepMerge(
					targetValue as Record<string, unknown>,
					sourceValue as Record<string, unknown>
				);
			} else {
				result[key] = sourceValue;
			}
		}

		return result;
	}

	/**
	 * Check if value is a plain object
	 */
	private isPlainObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}
}
