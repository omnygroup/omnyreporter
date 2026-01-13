import type { TestResultRecord, FailedTestRecord } from './FileSystemManager.js';

/**
 * Collects and manages test statistics throughout test execution
 */
export class TestStatisticsCollector {
	private passedTests: TestResultRecord[] = [];

	private failedTests: FailedTestRecord[] = [];

	private skippedTests: TestResultRecord[] = [];

	private totalDuration = 0;

	private readonly fileStats = new Map<string, { passed: number; failed: number; skipped: number; duration: number }>();

	/**
	 * Add a passed test
	 */
	public addPassedTest(test: TestResultRecord): void {
		this.passedTests.push(test);
		this.updateFileStats(test.filepath, 'passed', test.duration);
	}

	/**
	 * Add a failed test
	 */
	public addFailedTest(test: FailedTestRecord): void {
		this.failedTests.push(test);
		this.updateFileStats(test.filepath, 'failed', test.duration);
	}

	/**
	 * Add a skipped test
	 */
	public addSkippedTest(test: TestResultRecord): void {
		this.skippedTests.push(test);
		this.updateFileStats(test.filepath, 'skipped', test.duration);
	}

	/**
	 * Update statistics for a specific file
	 */
	private updateFileStats(filepath: string, type: 'passed' | 'failed' | 'skipped', duration: number): void {
		const key = this.normalizeFilepath(filepath);
		const stats = this.fileStats.get(key) ?? { passed: 0, failed: 0, skipped: 0, duration: 0 };

		if (type === 'passed') {
			stats.passed++;
		} else if (type === 'failed') {
			stats.failed++;
		} else {
			stats.skipped++;
		}
		stats.duration += duration;

		this.fileStats.set(key, stats);
		this.totalDuration += duration;
	}

	/**
	 * Normalize filepath for consistent grouping
	 */
	private normalizeFilepath(filepath: string): string {
		return filepath.replace(/\\/g, '/');
	}

	/**
	 * Get passed tests
	 */
	public getPassedTests(): TestResultRecord[] {
		return this.passedTests;
	}

	/**
	 * Get failed tests
	 */
	public getFailedTests(): FailedTestRecord[] {
		return this.failedTests;
	}

	/**
	 * Get skipped tests
	 */
	public getSkippedTests(): TestResultRecord[] {
		return this.skippedTests;
	}

	/**
	 * Get total counts
	 */
	public getCounts(): {
		total: number;
		passed: number;
		failed: number;
		skipped: number;
	} {
		return {
			total: this.passedTests.length + this.failedTests.length + this.skippedTests.length,
			passed: this.passedTests.length,
			failed: this.failedTests.length,
			skipped: this.skippedTests.length,
		};
	}

	/**
	 * Get duration in milliseconds
	 */
	public getDuration(): number {
		return this.totalDuration;
	}

	/**
	 * Get file statistics
	 */
	public getFileStats(): Map<string, { passed: number; failed: number; skipped: number; duration: number }> {
		return this.fileStats;
	}

	/**
	 * Get number of test files
	 */
	public getFileCount(): {
		total: number;
		withFailed: number;
		withPassed: number;
	} {
		let withFailed = 0;
		let withPassed = 0;

		for (const stats of this.fileStats.values()) {
			if (stats.failed > 0) {
				withFailed++;
			}
			if (stats.passed > 0 && stats.failed === 0) {
				withPassed++;
			}
		}

		return {
			total: this.fileStats.size,
			withFailed,
			withPassed,
		};
	}

	/**
	 * Reset collector
	 */
	public reset(): void {
		this.passedTests = [];
		this.failedTests = [];
		this.skippedTests = [];
		this.totalDuration = 0;
		this.fileStats.clear();
	}
}
