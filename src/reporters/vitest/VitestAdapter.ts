/**
 * Vitest adapter - integration with Vitest reporter hooks
 * Collects test results and aggregates statistics
 * @module reporters/vitest/VitestAdapter
 */

import { TestAnalytics } from '@domain/analytics/tests/TestAnalytics';

import { TaskProcessor ,type  TestResult } from './TaskProcessor.js';

import type { ILogger, TestStatistics } from '@core';


/**
 * Adapter implementing Vitest Reporter interface
 * Coordinates test collection and analytics aggregation
 */
export class VitestAdapter {
  private analytics: TestAnalytics;

  public constructor(
    private readonly logger: ILogger,
    private readonly verbose: boolean = false
  ) {
    this.analytics = new TestAnalytics();
  }

  /**
   * Initialize the Vitest reporter
   */
  public onInit(): void {
    this.logger.info('Vitest reporter initialized');
    this.analytics.reset();
  }

  /**
   * Handle test module completion
   * Extract test results and collect them
   * @param files Array of Vitest file objects
   */
  public onTestModuleEnd(files: unknown[]): void {
    this.logger.debug('Test module ended', { fileCount: (files).length });

    (files).forEach((file) => {
      const results = TaskProcessor.extractResults(file);
      results.forEach((result: TestResult) => {
        this.analytics.collect(result);
      });
    });
  }

  /**
   * Handle test run completion
   * Log final statistics
   */
  public onTestRunEnd(): void {
    const snapshot = this.analytics.getSnapshot();
    this.logger.info('Vitest test run completed', {
      totalTests: snapshot.totalCount,
      passed: snapshot.passedCount,
      failed: snapshot.failedCount,
      skipped: snapshot.skippedCount,
      totalDuration: snapshot.totalDuration,
    });
  }

  /**
   * Get aggregated test statistics
   * @returns Test statistics snapshot
   */
  public getTestStatistics(): TestStatistics {
    return this.analytics.getSnapshot();
  }

  /**
   * Get all collected test results
   * @returns Array of test results
   */
  public getTestResults(): readonly TestResult[] {
    return this.analytics.getResults();
  }

  /**
   * Reset analytics state
   */
  public reset(): void {
    this.analytics.reset();
  }
}
