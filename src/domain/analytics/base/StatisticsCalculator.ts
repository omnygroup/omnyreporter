/**
 * Statistics calculator utility
 * @module domain/analytics/base/StatisticsCalculator
 */

import type { Diagnostic, DiagnosticStatistics } from '@core';

/**
 * Utility for calculating diagnostic statistics
 */
export const StatisticsCalculator = {
  /**
   * Calculate statistics from diagnostics array
   * @param diagnostics Array of diagnostics
   * @returns Computed statistics
   */
  calculateDiagnosticStats(
    diagnostics: readonly Diagnostic[]
  ): DiagnosticStatistics {
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    let noteCount = 0;
    const totalByFile: Record<string, number> = {};
    const totalBySeverity: Record<string, number> = {
      error: 0,
      warning: 0,
      info: 0,
      note: 0,
    };
    const totalByCode: Record<string, number> = {};

    diagnostics.forEach((d) => {
      // Count by severity
      switch (d.severity) {
        case 'error':
          errorCount += 1;
          totalBySeverity['error'] = (totalBySeverity['error'] ?? 0) + 1;
          break;
        case 'warning':
          warningCount += 1;
          totalBySeverity['warning'] = (totalBySeverity['warning'] ?? 0) + 1;
          break;
        case 'info':
          infoCount += 1;
          totalBySeverity['info'] = (totalBySeverity['info'] ?? 0) + 1;
          break;
        case 'note':
          noteCount += 1;
          totalBySeverity['note'] = (totalBySeverity['note'] ?? 0) + 1;
          break;
      }

      // Count by file
      totalByFile[d.filePath] = (totalByFile[d.filePath] ?? 0) + 1;

      // Count by code
      totalByCode[d.code] = (totalByCode[d.code] ?? 0) + 1;
    });

    return {
      timestamp: new Date(),
      totalCount: diagnostics.length,
      errorCount,
      warningCount,
      infoCount,
      noteCount,
      totalByFile,
      totalBySeverity,
      totalByCode,
    };
  },
};
