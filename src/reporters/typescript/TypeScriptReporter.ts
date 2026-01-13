/**
 * Main TypeScript reporter implementation
 */

import os from 'node:os';

import { BaseDiagnosticSource } from '../shared/BaseDiagnosticSource.js';
import { DiagnosticsAggregatorImpl } from '../shared/DiagnosticsAggregator.js';

import type { Logger, PathNormalizer, SecurityValidator } from '../interfaces.js';
import type { DiagnosticsResult, ValidationStatus } from '../types.js';
import type { TscStreamProcessor } from './TscStreamProcessor.js';
import type { TypeScriptConfig } from './types.js';
import type { TypeScriptCompilerAPI } from './TypeScriptCompiler.js';

export class TypeScriptReporter extends BaseDiagnosticSource {
	readonly #compiler: TypeScriptCompilerAPI;
	readonly #streamProcessor: TscStreamProcessor;
	readonly #aggregator: DiagnosticsAggregatorImpl;

	public constructor(
		logger: Logger,
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator,
		compiler: TypeScriptCompilerAPI,
		streamProcessor: TscStreamProcessor
	) {
		super(logger, pathNormalizer, securityValidator);
		this.#compiler = compiler;
		this.#streamProcessor = streamProcessor;
		this.#aggregator = new DiagnosticsAggregatorImpl();
	}

	public async collect(config: TypeScriptConfig): Promise<DiagnosticsResult> {
		this.validateConfig(config);
		
		this.logger.info('Starting TypeScript diagnostics collection');

		try {
			// Get diagnostics from TypeScript compiler with timeout
			const tsDiagnostics = await this.withTimeout(
				this.#compiler.getDiagnostics(config.tsconfigPath),
				config.timeout
			);

			if (tsDiagnostics.length === 0) {
				this.logger.info('No TypeScript diagnostics found');
				return this.#createEmptyResult();
			}

			this.logger.debug('TypeScript diagnostics retrieved', {
				count: tsDiagnostics.length,
			});

			// Process diagnostics as stream
			const diagnosticStream = this.#streamProcessor.processDiagnostics(tsDiagnostics);

			// Aggregate results
			const result = await this.#aggregator.aggregate(diagnosticStream);

			// Add version metadata
			const resultWithMetadata: DiagnosticsResult = {
				...result,
				metadata: {
					...result.metadata,
					sourceVersion: this.#compiler.getVersion(),
				},
			};

			this.logger.info('TypeScript diagnostics collection completed', {
				files: result.summary.totalFiles,
				errors: result.summary.totalErrors,
				warnings: result.summary.totalWarnings,
			});

			return resultWithMetadata;
		} catch (error) {
			this.logger.error('TypeScript diagnostics collection failed', { error });
			throw error;
		}
	}

	public validate(): ValidationStatus {
		const errors: string[] = [];
		const warnings: string[] = [];

		try {
			// Check if tsconfig.json exists
			const isConfigured = this.#compiler.isConfigured();
			if (!isConfigured) {
				errors.push('tsconfig.json not found in project root');
			}

			// Check TypeScript version
			const version = this.#compiler.getVersion();
			if (version === '') {
				warnings.push('Could not determine TypeScript version');
			} else {
				this.logger.debug('TypeScript version detected', { version });

				// Check minimum version (4.5+)
				const parts = version.split('.').map(Number);
				const major = parts[0];
				const minor = parts[1];
				if (major !== undefined && minor !== undefined && (major < 4 || (major === 4 && minor < 5))) {
					warnings.push(`TypeScript version ${version} is below recommended minimum (4.5.0)`);
				}
			}
		} catch (error) {
			errors.push(`TypeScript validation failed: ${(error as Error).message}`);
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	#createEmptyResult(): DiagnosticsResult {
		return {
			diagnostics: [],
			summary: {
				totalFiles: 0,
				totalErrors: 0,
				totalWarnings: 0,
				processingTimeMs: 0,
			},
			metadata: {
				reportedAt: new Date(),
				sourceVersion: this.#compiler.getVersion(),
				executedOn: os.hostname(),
			},
		};
	}
}
