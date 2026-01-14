/**
 * Lint statistics calculator
 * @module domain/analytics/lint/LintStatisticsCalculator
 */

import type { Diagnostic } from '../../../core/index.js';
import type { LintStatistics } from './types.js';

/**
 * Calculates lint-specific statistics from diagnostics
 */
export class LintStatisticsCalculator {
  /**
   * Calculate lint statistics from diagnostics
   * @param diagnostics Array of diagnostics
   * @returns Lint statistics
   */
  public static calculateLintStats(diagnostics: readonly Diagnostic[]): LintStatistics {
    const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
    const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
    const infoCount = diagnostics.filter((d) => d.severity === 'info').length;
    const noteCount = diagnostics.filter((d) => d.severity === 'note').length;

    const autoFixableCount = diagnostics.filter((d) => d.fix !== undefined).length;

    // Count occurrences of each rule
    const ruleCount: Record<string, number> = {};
    const filesByRule: Record<string, number> = {};

    diagnostics.forEach((d) => {
      if (d.code) {
        ruleCount[d.code] = (ruleCount[d.code] ?? 0) + 1;
        const fileKey = `${d.code}`;
        filesByRule[fileKey] = (filesByRule[fileKey] ?? 0) + 1;
      }
    });

    // Get top 10 most common rules
    const mostCommonRules = Object.entries(ruleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([rule, count]) => ({ rule, count }));

    return {
      timestamp: new Date(),
      totalCount: diagnostics.length,
      errorCount,
      warningCount,
      infoCount,
      noteCount,
      autoFixableCount,
      mostCommonRules,
      filesByRule,
    };
  }
}
