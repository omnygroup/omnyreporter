/**
 * Test analytics calculator
 * @module domain/analytics/tests/TestStatisticsCalculator
 */

import type { TestStatistics } from '../../../core/index.js';
import type { TestResult } from '../../../reporters/vitest/TaskProcessor.js';

/**
 * Calculates statistics from test results
 */
export class TestStatisticsCalculator {
  /**
   * Calculate statistics from test results
   * @param results Array of test results
   * @returns Test statistics
   */
  public static calculateTestStats(results: readonly TestResult[]): TestStatistics {
    const passedCount = results.filter((r) => r.status === 'passed').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const skippedCount = results.filter((r) => r.status === 'skipped').length;

    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = results.length > 0 ? totalDuration / results.length : 0;

    const sorted = [...results].sort((a, b) => b.duration - a.duration);
    const slowestTests = sorted.slice(0, 10).map((t) => ({
      name: t.name,
      duration: t.duration,
    }));

    return {
      timestamp: new Date(),
      totalCount: results.length,
      passedCount,
      failedCount,
      skippedCount,
      totalDuration,
      averageDuration,
      slowestTests,
    };
  }
}
