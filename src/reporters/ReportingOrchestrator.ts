/**
 * Reporting orchestrator - coordinates multiple reporters
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { ReportingFacade } from './ReportingFacade.js';
import { DirectoryManager } from './shared/DirectoryManager.js';
import { LoggerImpl } from './shared/Logger.js';

import type { Logger } from './interfaces.js';
import type { CombinedReportingResult, ReportingConfig } from './ReportingConfig.js';

export class ReportingOrchestrator {
	readonly #config: ReportingConfig;
	readonly #facade: ReportingFacade;
	readonly #logger: Logger;
	readonly #directoryManager: DirectoryManager;

	public constructor(config: ReportingConfig) {
		this.#config = config;
		this.#facade = new ReportingFacade(config.cwd, config.outputDir);
		this.#logger = new LoggerImpl({
			level: config.verbose ? 'debug' : 'info',
		});
		this.#directoryManager = new DirectoryManager(config.outputDir, config.cwd);
	}

	/**
	 * Execute reporters based on configuration
	 */
	public async execute(): Promise<CombinedReportingResult> {
		this.#logger.info('Starting diagnostic reporting', {
			run: this.#config.run,
			cwd: this.#config.cwd,
		});

		const startTime = Date.now();
		const result: CombinedReportingResult = {
			success: true,
			totalErrors: 0,
			totalWarnings: 0,
			filesWritten: 0,
		};

		try {
			if (this.#config.run === 'eslint') {
				await this.#runEslint(result);
			} else if (this.#config.run === 'typescript') {
				await this.#runTypeScript(result);
			} else {
				// Run both in parallel
				await this.#runAll(result);
			}

			// Write combined summary
			await this.#writeSummary(result);

			const duration = Date.now() - startTime;
			this.#logger.info('Diagnostic reporting completed', {
				success: result.success,
				totalErrors: result.totalErrors,
				totalWarnings: result.totalWarnings,
				filesWritten: result.filesWritten,
				durationMs: duration,
			});

			return result;
		} catch (error) {
			this.#logger.error('Diagnostic reporting failed', { error });
			throw error;
		}
	}

	async #runEslint(result: CombinedReportingResult): Promise<void> {
		const startTime = Date.now();
		const updatedResult = result;
		
		try {
			const { result: eslintResult, writeStats } = await this.#facade.collectEslintDiagnostics(
				this.#config.eslintConfig
			);

			updatedResult.eslint = {
				success: eslintResult.summary.totalErrors === 0,
				errors: eslintResult.summary.totalErrors,
				warnings: eslintResult.summary.totalWarnings,
				files: eslintResult.summary.totalFiles,
				durationMs: Date.now() - startTime,
			};

			updatedResult.totalErrors += eslintResult.summary.totalErrors;
			updatedResult.totalWarnings += eslintResult.summary.totalWarnings;
			updatedResult.filesWritten += writeStats.filesWritten;

			if (eslintResult.summary.totalErrors > 0) {
				updatedResult.success = false;
			}
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			this.#logger.error('ESLint reporting failed', { error: errorMsg });
			updatedResult.success = false;
			updatedResult.eslint = {
				success: false,
				errors: 0,
				warnings: 0,
				files: 0,
				durationMs: Date.now() - startTime,
			};
		}
	}

	async #runTypeScript(result: CombinedReportingResult): Promise<void> {
		const startTime = Date.now();
		const updatedResult = result;
		
		try {
			const { result: tsResult, writeStats } = await this.#facade.collectTypeScriptDiagnostics(
				this.#config.typescriptConfig
			);

			updatedResult.typescript = {
				success: tsResult.summary.totalErrors === 0,
				errors: tsResult.summary.totalErrors,
				warnings: tsResult.summary.totalWarnings,
				files: tsResult.summary.totalFiles,
				durationMs: Date.now() - startTime,
			};

			updatedResult.totalErrors += tsResult.summary.totalErrors;
			updatedResult.totalWarnings += tsResult.summary.totalWarnings;
			updatedResult.filesWritten += writeStats.filesWritten;

			if (tsResult.summary.totalErrors > 0) {
				updatedResult.success = false;
			}
		} catch (error) {
			this.#logger.error('TypeScript reporting failed', { error });
			updatedResult.success = false;
			updatedResult.typescript = {
				success: false,
				errors: 0,
				warnings: 0,
				files: 0,
				durationMs: Date.now() - startTime,
			};
		}
	}

	async #runAll(result: CombinedReportingResult): Promise<void> {
		// Run both in parallel
		await Promise.all([
			this.#runEslint(result),
			this.#runTypeScript(result),
		]);
	}

	async #writeSummary(result: CombinedReportingResult): Promise<void> {
		const summaryPath = path.join(this.#directoryManager.getRootDir(), 'report.json');
		
		try {
			await fs.mkdir(path.dirname(summaryPath), { recursive: true });
			await fs.writeFile(summaryPath, JSON.stringify(result, null, 2), 'utf8');
			this.#logger.debug('Summary written', { path: summaryPath });
		} catch (error) {
			this.#logger.warn('Failed to write summary', { error });
		}
	}

	/**
	 * Print results to console
	 */
	public printResults(result: CombinedReportingResult): void {
		this.#logger.warn('📊 Diagnostic Report Summary');
		this.#logger.warn('═'.repeat(60));

		if (result.eslint !== undefined) {
			this.#logger.warn('📝 ESLint:');
			this.#logger.warn(`   Files:    ${String(result.eslint.files)}`);
			this.#logger.warn(`   Errors:   ${String(result.eslint.errors)}`);
			this.#logger.warn(`   Warnings: ${String(result.eslint.warnings)}`);
			this.#logger.warn(`   Duration: ${String(result.eslint.durationMs)}ms`);
			this.#logger.warn(`   Status:   ${result.eslint.success ? '✅ PASS' : '❌ FAIL'}`);
		}

		if (result.typescript !== undefined) {
			this.#logger.warn('📘 TypeScript:');
			this.#logger.warn(`   Files:    ${String(result.typescript.files)}`);
			this.#logger.warn(`   Errors:   ${String(result.typescript.errors)}`);
			this.#logger.warn(`   Warnings: ${String(result.typescript.warnings)}`);
			this.#logger.warn(`   Duration: ${String(result.typescript.durationMs)}ms`);
			this.#logger.warn(`   Status:   ${result.typescript.success ? '✅ PASS' : '❌ FAIL'}`);
		}

		this.#logger.warn('═'.repeat(60));
		this.#logger.warn(`📦 Total Errors:   ${String(result.totalErrors)}`);
		this.#logger.warn(`⚠️  Total Warnings: ${String(result.totalWarnings)}`);
		this.#logger.warn(`📁 Files Written:  ${String(result.filesWritten)}`);
		this.#logger.warn(`\n${result.success ? '✅ All checks passed!' : '❌ Some checks failed.'}`);
	}
}
