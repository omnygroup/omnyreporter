/**
 * Test Analytics
 * Collects and calculates test statistics
 * @module reporters/vitest/TestAnalytics
 */

import type { TestResult } from './TaskProcessor.js';
import type { TestStatistics } from '@core';

/**
 * Test analytics collector for Vitest
 */
export class TestAnalytics {
	private results: TestResult[] = [];
	private stats: TestStatistics;

	public constructor() {
		this.stats = this.createInitialStats();
	}

	public collect(result: TestResult): void {
		this.results.push(result);
		this.recalculate();
	}

	public collectAll(results: readonly TestResult[]): void {
		this.results.push(...results);
		this.recalculate();
	}

	public getSnapshot(): TestStatistics {
		return { ...this.stats };
	}

	public getResults(): readonly TestResult[] {
		return [...this.results];
	}

	public reset(): void {
		this.results = [];
		this.stats = this.createInitialStats();
	}

	private createInitialStats(): TestStatistics {
		return {
			timestamp: new Date(),
			totalCount: 0,
			passedCount: 0,
			failedCount: 0,
			skippedCount: 0,
			totalDuration: 0,
			averageDuration: 0,
			slowestTests: [],
		};
	}

	private recalculate(): void {
		const r = this.results;
		const totalDuration = r.reduce((sum, t) => sum + t.duration, 0);
		const slowest = [...r]
			.sort((a, b) => b.duration - a.duration)
			.slice(0, 5)
			.map((t) => ({ name: t.name, duration: t.duration }));

		this.stats = {
			timestamp: new Date(),
			totalCount: r.length,
			passedCount: r.filter((t) => t.status === 'passed').length,
			failedCount: r.filter((t) => t.status === 'failed').length,
			skippedCount: r.filter((t) => t.status === 'skipped').length,
			totalDuration,
			averageDuration: r.length > 0 ? totalDuration / r.length : 0,
			slowestTests: slowest,
		};
	}
}
