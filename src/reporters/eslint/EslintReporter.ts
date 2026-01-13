/**
 * Main ESLint reporter implementation
 */

import { BaseDiagnosticSource } from '../shared/BaseDiagnosticSource.js';
import { DiagnosticsAggregatorImpl } from '../shared/DiagnosticsAggregator.js';

import type { Logger, PathNormalizer, SecurityValidator } from '../interfaces.js';
import type { DiagnosticsResult, ValidationStatus } from '../types.js';
import type { EslintLinterAPI } from './EslintLinter.js';
import type { FileCollector } from './FileCollector.js';
import type { LintStreamProcessor } from './LintStreamProcessor.js';
import type { EslintConfig } from './types.js';

export class EslintReporter extends BaseDiagnosticSource {
	readonly #linter: EslintLinterAPI;
	readonly #streamProcessor: LintStreamProcessor;
	readonly #aggregator: DiagnosticsAggregatorImpl;

	public constructor(
		logger: Logger,
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator,
		linter: EslintLinterAPI,
		fileCollector: FileCollector,
		streamProcessor: LintStreamProcessor
	) {
		super(logger, pathNormalizer, securityValidator);
		this.#linter = linter;
		// fileCollector is not used now, but kept for future compatibility
		void fileCollector;
		this.#streamProcessor = streamProcessor;
		this.#aggregator = new DiagnosticsAggregatorImpl();
	}

	public async collect(config: EslintConfig): Promise<DiagnosticsResult> {
		this.validateConfig(config);
		
		this.logger.info('Starting ESLint diagnostics collection');

		try {
			// Determine file patterns (default: src/)
			const filePatterns = config.patterns !== undefined && config.patterns.length > 0 
				? Array.from(config.patterns)
				: ['src'];
			
			this.logger.debug('Using file patterns', { patterns: filePatterns });

			// Run ESLint with timeout
			const lintResults = await this.withTimeout(
				this.#linter.lint(filePatterns),
				config.timeout
			);

			this.logger.debug('ESLint completed', { resultCount: lintResults.length });

			// Process results as stream
			const diagnosticStream = this.#streamProcessor.processLintResults(lintResults);

			// Aggregate results
			const result = await this.#aggregator.aggregate(diagnosticStream);

			// Add version metadata
			const resultWithMetadata: DiagnosticsResult = {
				...result,
				metadata: {
					...result.metadata,
					sourceVersion: this.#linter.getVersion(),
				},
			};

			this.logger.info('ESLint diagnostics collection completed', {
				files: result.summary.totalFiles,
				errors: result.summary.totalErrors,
				warnings: result.summary.totalWarnings,
			});

			return resultWithMetadata;
		} catch (error) {
			this.logger.error('ESLint diagnostics collection failed', { error });
			throw error;
		}
	}

	public async validate(): Promise<ValidationStatus> {
		const errors: string[] = [];
		const warnings: string[] = [];

		try {
			// Check if ESLint is configured
			const isConfigured = await this.#linter.isConfigured();
			if (!isConfigured) {
				errors.push('ESLint is not properly configured');
			}

			// Check ESLint version
			const version = this.#linter.getVersion();
			if (version === '') {
				warnings.push('Could not determine ESLint version');
			} else {
				this.logger.debug('ESLint version detected', { version });
			}
		} catch (error) {
			errors.push(`ESLint validation failed: ${(error as Error).message}`);
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}
}
