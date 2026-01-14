/**
 * TypeScript statistics calculator
 * @module domain/analytics/typescript/TypeScriptStatisticsCalculator
 */

import type { Diagnostic } from '../../../core/index.js';
import type { TypeScriptStatistics } from './types.js';

/**
 * Calculates TypeScript-specific statistics from diagnostics
 */
export class TypeScriptStatisticsCalculator {
  /**
   * Calculate TypeScript statistics from diagnostics
   * @param diagnostics Array of diagnostics
   * @returns TypeScript statistics
   */
  public static calculateTypeScriptStats(diagnostics: readonly Diagnostic[]): TypeScriptStatistics {
    const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
    const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
    const infoCount = diagnostics.filter((d) => d.severity === 'info').length;

    const filesWithErrors: Record<string, number> = {};
    const totalByCode: Record<string, number> = {};

    diagnostics.forEach((d) => {
      // filePath is the canonical file location on Diagnostic
      if (d.filePath) {
        const fileKey = d.filePath;
        if (d.severity === 'error') {
          filesWithErrors[fileKey] = (filesWithErrors[fileKey] ?? 0) + 1;
        }
      }

      // code is required on Diagnostic, count occurrences per code
      totalByCode[d.code] = (totalByCode[d.code] ?? 0) + 1;
    });

    const mostCommonErrorCodes = Object.entries(totalByCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }));

    return {
      timestamp: new Date(),
      totalCount: diagnostics.length,
      errorCount,
      warningCount,
      infoCount,
      filesWithErrors,
      totalByCode,
      mostCommonErrorCodes,
    };
  }
}
