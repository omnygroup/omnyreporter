import { resolve } from 'node:path';

import { FileSystemManager } from './utils/FileSystemManager.js';
import { logger } from './logger/Logger.js';
import { sanitizer } from './utils/SensitiveDataSanitizer.js';
import { TestStatisticsCollector } from './utils/TestStatisticsCollector.js';

/**
 * Vitest Task state constants
 */
const TASK_STATES = {
	PASS: 'pass',
	FAIL: 'fail',
	SKIP: 'skip',
	TODO: 'todo',
} as const;

/**
 * Configuration options for VitestReporter
 */
export interface VitestReporterConfig {
	/**
	 * Output format for test results
	 * - 'console': Only console output
	 * - 'file': Only file output (JSON)
	 * - 'both': Console and file output
	 */
	format: 'console' | 'file' | 'both';

	/**
	 * Directory where test results will be saved (when format is 'file' or 'both')
	 * @default './test-results'
	 */
	outputDir?: string;

	/**
	 * Enable detailed verbose output
	 * @default false
	 */
	verbose?: boolean;
}

/**
 * Vitest Test Module and Task types
 */
interface TestModule {
	name: string;
	filepath: string;
	tasks?: VitestTask[];
}

/**
 * Task interface for Vitest 4.x
 */
interface VitestTask {
	name: string;
	filepath?: string;
	state?: string;
	type?: string;
	result?: {
		state: string;
		duration: number;
		errors?: Array<{ message: string; stack: string }>;
	};
	tasks?: VitestTask[];
}

/**
 * SerializedError type from Vitest
 */
interface SerializedError {
	message: string;
	stack?: string;
}

/**
 * OmnyReporter for Vitest
 * Provides configurable test result reporting to console and/or file
 */
class OmnyVitestReporter {
	private readonly config: Required<VitestReporterConfig>;

	private readonly startTime: number;

	private readonly statistics: TestStatisticsCollector;

	private readonly fileSystemManager: FileSystemManager;

	private ctx: unknown = null;

	public constructor(config: VitestReporterConfig) {
		this.config = {
			format: config.format,
			outputDir: config.outputDir || './test-results',
			verbose: config.verbose || false,
		};
		this.startTime = Date.now();
		this.statistics = new TestStatisticsCollector();
		this.fileSystemManager = new FileSystemManager();
		logger.info(`OmnyReporter initialized with format: ${this.config.format}`);
	}

	/**
	 * Called on reporter initialization
	 */
	public onInit(ctx: unknown): void {
		this.ctx = ctx;
		logger.debug('Reporter context initialized');
	}

	/**
	 * Called when individual test module ends - collect results incrementally
	 */
	public async onTestModuleEnd(testModule: TestModule): Promise<void> {
		try {
			// TestModule can have a nested task structure or direct tasks
			const taskContainer = (testModule as unknown as Record<string, unknown>)['task'] || testModule;
			const filepath = (taskContainer as Record<string, unknown>)['filepath'] as string || testModule.filepath;
			const tasks = (taskContainer as Record<string, unknown>)['tasks'] as VitestTask[] || testModule.tasks;

			if (!filepath) {
				logger.warn('Test module has no filepath');
				return;
			}

			const normalizedPath = resolve(filepath);

			if (tasks && Array.isArray(tasks)) {
				for (const testTask of tasks) {
					this.processTestTask(testTask, normalizedPath);
				}
			}

			if (this.config.verbose) {
				logger.debug(`Processed test module: ${filepath}`);
			}
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			logger.error({ error: msg }, 'Error in onTestModuleEnd');
		}
	}

	/**
	 * Called when test run ends - write summary
	 */
	public async onTestRunEnd(): Promise<void> {
		try {
			const duration = Date.now() - this.startTime;

			if (this.config.format === 'console' || this.config.format === 'both') {
				this.logSummaryToConsole(duration);
			}

			if (this.config.format === 'file' || this.config.format === 'both') {
				await this.writeSummaryToFiles(duration);
			}
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			logger.error({ error: msg }, 'Error in onTestRunEnd');
			throw error;
		}
	}

	/**
	 * Process individual test task, including nested tasks
	 */
	private processTestTask(task: VitestTask, filepath: string): void {
		const state = task.result?.state || task.state;
		const duration = task.result?.duration || 0;
		const testName = task.name || 'Unknown';
		const timestamp = new Date().toISOString();

		// Process nested tasks first (describe blocks contain tests)
		if (task.tasks && Array.isArray(task.tasks)) {
			for (const nestedTask of task.tasks) {
				this.processTestTask(nestedTask, filepath);
			}
			// If this task has nested tasks, it's a describe block, so don't count it
			return;
		}

		// Only process leaf-level tasks (actual tests, not describe blocks)
		if (state === TASK_STATES.PASS) {
			this.statistics.addPassedTest({
				name: testName,
				filepath,
				duration,
				timestamp,
				fullName: testName,
			});
		} else if (state === TASK_STATES.FAIL) {
			const error = task.result?.errors?.[0];
			this.statistics.addFailedTest({
				name: testName,
				filepath,
				duration,
				timestamp,
				fullName: testName,
				error: error?.message || 'Unknown error',
				message: error?.message || 'Unknown error',
				stack: error?.stack || '',
			});
		} else if (state === TASK_STATES.SKIP || state === TASK_STATES.TODO) {
			this.statistics.addSkippedTest({
				name: testName,
				filepath,
				duration,
				timestamp,
				fullName: testName,
			});
		}
	}

	/**
	 * Log test summary to console
	 */
	private logSummaryToConsole(duration: number): void {
		const counts = this.statistics.getCounts();
		const fileCount = this.statistics.getFileCount();

		const passColor = '\x1b[32m'; // Green
		const failColor = '\x1b[31m'; // Red
		const skipColor = '\x1b[33m'; // Yellow
		const resetColor = '\x1b[0m';

		logger.info('');
		logger.info('╔════════════════════════════════════════╗');
		logger.info('║       Test Results Summary              ║');
		logger.info('╚════════════════════════════════════════╝');

		// File summary
		let fileSummary = `Test Files  `;
		if (fileCount.withFailed > 0) {
			fileSummary += `${failColor}${fileCount.withFailed} failed${resetColor} | `;
		}
		fileSummary += `${passColor}${fileCount.withPassed} passed${resetColor} (${fileCount.total})`;
		logger.info(fileSummary);

		// Test summary
		let testSummary = `Tests  `;
		if (counts.failed > 0) {
			testSummary += `${failColor}${counts.failed} failed${resetColor} | `;
		}
		testSummary += `${passColor}${counts.passed} passed${resetColor}`;
		if (counts.skipped > 0) {
			testSummary += ` ${skipColor}${counts.skipped} skipped${resetColor}`;
		}
		testSummary += ` (${counts.total})`;
		logger.info(testSummary);

		logger.info(`Duration: ${(duration / 1000).toFixed(2)}s`);
		logger.info('');
	}

	/**
	 * Write test summary to files in .omnyreporter directory
	 */
	private async writeSummaryToFiles(duration: number): Promise<void> {
		try {
			await this.fileSystemManager.initialize();

			const passedTests = this.statistics.getPassedTests();
			const failedTests = this.statistics.getFailedTests();

			if (passedTests.length > 0) {
				const passedSummary = {
					totalCount: passedTests.length,
					tests: passedTests,
					duration,
					timestamp: new Date().toISOString(),
				};
				await this.fileSystemManager.writePassedTests(passedSummary);
			}

			if (failedTests.length > 0) {
				const failedSummary = {
					totalCount: failedTests.length,
					tests: failedTests,
					duration,
					timestamp: new Date().toISOString(),
				};
				await this.fileSystemManager.writeFailedTests(failedSummary);
			}

			const counts = this.statistics.getCounts();
			const fileCount = this.statistics.getFileCount();

			const summary = {
				timestamp: new Date().toISOString(),
				duration: Math.round(duration),
				files: {
					passed: fileCount.withPassed,
					failed: fileCount.withFailed,
					total: fileCount.total,
				},
				tests: {
					passed: counts.passed,
					failed: counts.failed,
					skipped: counts.skipped,
					total: counts.total,
				},
			};

			await this.fileSystemManager.writeRunSummary(summary);

			logger.info('Test results written to .omnyreporter/');
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			logger.error({ error: msg }, 'Error writing summary files');
			throw error;
		}
	}
}

/**
 * Factory function to create a VitestReporter instance
 * @param config Reporter configuration options
 * @returns Configured reporter instance
 *
 * @example
 * ```typescript
 * // In vitest.config.ts
 * import { createVitestReporter } from '@omnygroup/omnyreporter/vitest-reporter';
 *
 * export default defineConfig({
 *   test: {
 *     reporters: [
 *       createVitestReporter({
 *         format: 'both',
 *         outputDir: './test-results',
 *         verbose: true,
 *       }),
 *     ],
 *   },
 * });
 * ```
 */
export function createVitestReporter(config: VitestReporterConfig): OmnyVitestReporter {
	return new OmnyVitestReporter(config);
}

export default createVitestReporter;
