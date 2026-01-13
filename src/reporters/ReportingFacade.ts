/**
 * Reporting facade - simplified interface for running reporters
 */

import { createConfig } from './config.js';
import { EslintReporterFactory } from './eslint/EslintReporterFactory.js';
import { DirectoryManager } from './shared/DirectoryManager.js';
import { JsonReportWriter } from './shared/JsonReportWriter.js';
import { LoggerImpl } from './shared/Logger.js';
import { SecurityValidatorImpl } from './shared/SecurityValidator.js';
import { TypeScriptReporterFactory } from './typescript/TypeScriptReporterFactory.js';

import type { EslintConfig } from './eslint/types.js';
import type { DiagnosticsResult, WriteStats } from './types.js';
import type { TypeScriptConfig } from './typescript/types.js';

export class ReportingFacade {
	readonly #cwd: string;
	readonly #outputDir?: string;

	public constructor(cwd: string = process.cwd(), outputDir?: string) {
		this.#cwd = cwd;
		this.#outputDir = outputDir;
	}

	/**
	 * Collect ESLint diagnostics and write to disk
	 */
	public async collectEslintDiagnostics(
		partialConfig: Partial<EslintConfig> = {}
	): Promise<{ result: DiagnosticsResult; writeStats: WriteStats }> {
		const baseConfig = createConfig({ cwd: this.#cwd, outputDir: this.#outputDir });
		const config: EslintConfig = {
			cwd: baseConfig.cwd,
			maxBuffer: baseConfig.maxBuffer,
			timeout: baseConfig.timeout,
			securityPolicy: baseConfig.securityPolicy,
			outputDir: baseConfig.outputDir,
			includeSource: baseConfig.includeSource,
			sanitize: baseConfig.sanitize,
			patterns: baseConfig.patterns !== undefined ? Array.from(baseConfig.patterns) : undefined,
			ignorePatterns: baseConfig.ignorePatterns !== undefined ? Array.from(baseConfig.ignorePatterns) : undefined,
			...partialConfig,
		};

		// Create reporter and collect diagnostics
		const reporter = EslintReporterFactory.create(config);
		const result = await reporter.collect(config);

		// Write results to disk
		const writeStats = await this.#writeDiagnostics(result, 'eslint');

		return { result, writeStats };
	}

	/**
	 * Collect TypeScript diagnostics and write to disk
	 */
	public async collectTypeScriptDiagnostics(
		partialConfig: Partial<TypeScriptConfig> = {}
	): Promise<{ result: DiagnosticsResult; writeStats: WriteStats }> {
		const baseConfig = createConfig({ cwd: this.#cwd, outputDir: this.#outputDir });
		const config: TypeScriptConfig = {
			cwd: baseConfig.cwd,
			maxBuffer: baseConfig.maxBuffer,
			timeout: baseConfig.timeout,
			securityPolicy: baseConfig.securityPolicy,
			outputDir: baseConfig.outputDir,
			includeSource: baseConfig.includeSource,
			sanitize: baseConfig.sanitize,
			patterns: baseConfig.patterns !== undefined ? Array.from(baseConfig.patterns) : undefined,
			ignorePatterns: baseConfig.ignorePatterns !== undefined ? Array.from(baseConfig.ignorePatterns) : undefined,
			...partialConfig,
		};

		// Create reporter and collect diagnostics
		const reporter = TypeScriptReporterFactory.create(config);
		const result = await reporter.collect(config);

		// Write results to disk
		const writeStats = await this.#writeDiagnostics(result, 'typescript');

		return { result, writeStats };
	}

	/**
	 * Collect all diagnostics (ESLint and TypeScript)
	 */
	public async collectAll(
		eslintConfig: Partial<EslintConfig> = {},
		typescriptConfig: Partial<TypeScriptConfig> = {}
	): Promise<{
		eslint: { result: DiagnosticsResult; writeStats: WriteStats };
		typescript: { result: DiagnosticsResult; writeStats: WriteStats };
	}> {
		const [eslint, typescript] = await Promise.all([
			this.collectEslintDiagnostics(eslintConfig),
			this.collectTypeScriptDiagnostics(typescriptConfig),
		]);

		return { eslint, typescript };
	}

	async #writeDiagnostics(
		result: DiagnosticsResult,
		type: 'eslint' | 'typescript'
	): Promise<WriteStats> {
		const logger = new LoggerImpl();
		const directoryManager = new DirectoryManager(this.#outputDir, this.#cwd);
		const securityValidator = new SecurityValidatorImpl(this.#cwd);
		
		const writer = new JsonReportWriter(directoryManager, securityValidator, logger);

		// Clean output directory before writing
		await directoryManager.cleanOutputDir(type);

		// Write diagnostics as stream
		async function* diagnosticStream(): AsyncGenerator<unknown, void, unknown> {
			for (const diagnostic of result.diagnostics) {
				yield await Promise.resolve(diagnostic);
			}
		}

		return writer.writeStream(diagnosticStream());
	}
}
