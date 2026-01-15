/**
 * TypeScript analytics types
 * @module domain/analytics/typescript/types
 */

import type { StatisticsBase } from '../../../core/index.js';

/**
 * Statistics specific to TypeScript diagnostics
 */
export interface TypeScriptStatistics extends StatisticsBase {
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
  readonly filesWithErrors: Record<string, number>;
  readonly totalByCode: Record<string, number>;
  readonly mostCommonErrorCodes: { readonly code: string; readonly count: number }[];
}

