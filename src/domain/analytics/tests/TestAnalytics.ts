/**
 * Test analytics collector
 * @module domain/analytics/tests/TestAnalytics
 */

import { BaseAnalyticsCollector ,type  TestStatistics } from '../../../core/index.js';

import { TestStatisticsCalculator } from './TestStatisticsCalculator.js';

import type { TestResult } from '../../../reporters/vitest/TaskProcessor.js';


/**
 * Analytics collector for test results
 * Aggregates test data and calculates statistics
 */
export class TestAnalytics extends BaseAnalyticsCollector<TestResult, TestStatistics> {
  private results: TestResult[] = [];

  public constructor() {
    super();
  }

  public collect(result: TestResult): void {
    this.results.push(result);
    this.stats = TestStatisticsCalculator.calculateTestStats(this.results);
  }

  protected createInitialStats(): TestStatistics {
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

  /**
   * Get all collected test results
   * @returns Array of test results
   */
  public getResults(): readonly TestResult[] {
    return Object.freeze([...this.results]);
  }

  public override reset(): void {
    this.results = [];
    super.reset();
  }
}
