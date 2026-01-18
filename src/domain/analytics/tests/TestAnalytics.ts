/**
 * Test analytics collector
 * @module domain/analytics/tests/TestAnalytics
 */

import { type TestStatistics } from '@core';

import { BaseAnalytics } from '../BaseAnalytics.js';

import { TestStatisticsCalculator } from './TestStatisticsCalculator.js';

import type { TestResult } from '@reporters/vitest/TaskProcessor';

/**
 * Analytics collector for test results
 * Simple implementation for test statistics
 */
export class TestAnalytics extends BaseAnalytics<TestResult, TestStatistics> {
  private results: TestResult[] = [];

  public constructor() {
    super();
  }

  public collect(result: TestResult): void {
    this.results.push(result);
    this.recalculateStats();
  }

  /**
   * Get all collected test results
   * @returns Array of test results
   */
  public getResults(): readonly TestResult[] {
    return Object.freeze([...this.results]);
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
   * Recalculate statistics
   */
  private recalculateStats(): void {
    this.stats = TestStatisticsCalculator.calculateTestStats(this.results);
  }
}
