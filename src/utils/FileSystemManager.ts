import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { logger } from '../logger/Logger.js';

/**
 * Structure for storing individual test result
 */
export interface TestResultRecord {
	name: string;
	filepath: string;
	duration: number;
	timestamp: string;
	fullName: string;
}

/**
 * Structure for failed test with error details
 */
export interface FailedTestRecord extends TestResultRecord {
	error: string;
	stack?: string;
	message: string;
}

/**
 * Summary data for passed/failed tests
 */
export interface TestResultsSummary {
	totalCount: number;
	tests: TestResultRecord[] | FailedTestRecord[];
	duration: number;
	timestamp: string;
}

/**
 * Manages .omnyreporter/ directory structure and file operations
 */
export class FileSystemManager {
	private static readonly UNKNOWN_ERROR_MESSAGE = 'Unknown error';

	private readonly baseDir: string;

	private readonly passedDir: string;

	private readonly failedDir: string;

	public constructor(projectRoot = '.') {
		this.baseDir = join(projectRoot, '.omnyreporter');
		this.passedDir = join(this.baseDir, 'passed');
		this.failedDir = join(this.baseDir, 'failed');
	}

	/**
	 * Initialize directory structure
	 */
	public async initialize(): Promise<void> {
		try {
			await mkdir(this.passedDir, { recursive: true });
			await mkdir(this.failedDir, { recursive: true });
			logger.info('Initialized .omnyreporter directory structure');
		} catch (error) {
			logger.error(`Failed to initialize .omnyreporter directories: ${error instanceof Error ? error.message : FileSystemManager.UNKNOWN_ERROR_MESSAGE}`);
		}
	}

	/**
	 * Clear previous run results
	 */
	public async clearPreviousResults(): Promise<void> {
		try {
			await rm(this.passedDir, { recursive: true, force: true });
			await rm(this.failedDir, { recursive: true, force: true });
			await mkdir(this.passedDir, { recursive: true });
			await mkdir(this.failedDir, { recursive: true });
			logger.debug('Cleared previous test results');
		} catch (error) {
			logger.error(`Failed to clear previous results: ${error instanceof Error ? error.message : FileSystemManager.UNKNOWN_ERROR_MESSAGE}`);
		}
	}

	/**
	 * Write passed test results
	 */
	public async writePassedTests(summary: TestResultsSummary): Promise<void> {
		try {
			const summaryPath = join(this.passedDir, 'summary.json');
			const content = JSON.stringify(summary, null, 2);
			await writeFile(summaryPath, content);
			logger.info(`Wrote ${String(summary.totalCount)} passed tests to .omnyreporter/passed/`);
		} catch (error) {
			logger.error(`Failed to write passed tests: ${error instanceof Error ? error.message : FileSystemManager.UNKNOWN_ERROR_MESSAGE}`);
		}
	}

	/**
	 * Write failed test results
	 */
	public async writeFailedTests(summary: TestResultsSummary): Promise<void> {
		try {
			const summaryPath = join(this.failedDir, 'summary.json');
			const content = JSON.stringify(summary, null, 2);
			await writeFile(summaryPath, content);
			logger.info(`Wrote ${String(summary.totalCount)} failed tests to .omnyreporter/failed/`);
		} catch (error) {
			logger.error(`Failed to write failed tests: ${error instanceof Error ? error.message : FileSystemManager.UNKNOWN_ERROR_MESSAGE}`);
		}
	}

	/**
	 * Write overall run summary
	 */
	public async writeRunSummary(summary: Record<string, unknown>): Promise<void> {
		try {
			const summaryPath = join(this.baseDir, 'run-summary.json');
			const content = JSON.stringify(summary, null, 2);
			await writeFile(summaryPath, content);
			logger.debug('Wrote run summary');
		} catch (error) {
			logger.error(`Failed to write run summary: ${error instanceof Error ? error.message : FileSystemManager.UNKNOWN_ERROR_MESSAGE}`);
		}
	}

	/**
	 * Get base directory path
	 */
	public getBaseDir(): string {
		return this.baseDir;
	}

	/**
	 * Get passed tests directory
	 */
	public getPassedDir(): string {
		return this.passedDir;
	}

	/**
	 * Get failed tests directory
	 */
	public getFailedDir(): string {
		return this.failedDir;
	}
}
