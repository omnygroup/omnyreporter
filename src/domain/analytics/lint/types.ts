/**
 * Lint analytics types
 * @module domain/analytics/lint/types
 */

import type { StatisticsBase } from '../../../core/index.js';

/**
 * Statistics specific to linting
 */
export interface LintStatistics extends StatisticsBase {
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
  readonly noteCount: number;
  readonly autoFixableCount: number;
  readonly mostCommonRules: Array<{ readonly rule: string; readonly count: number }>;
  readonly filesByRule: Record<string, number>;
}
