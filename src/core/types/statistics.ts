/**
 * Statistics and analytics types
 * @module core/types/statistics
 */

/** Base statistics interface - extended by specific collectors */
export interface StatisticsBase {
	readonly timestamp: Date;
	readonly totalCount: number;
}

/** Statistics for diagnostics (errors, warnings, etc.) */
export interface DiagnosticStatistics extends StatisticsBase {
	readonly errorCount: number;
	readonly warningCount: number;
	readonly infoCount: number;
	readonly noteCount: number;
	readonly totalByFile: Record<string, number>;
	readonly totalBySeverity: Record<string, number>;
	readonly totalByCode: Record<string, number>;
}

/** Statistics for test results */
export interface TestStatistics extends StatisticsBase {
	readonly passedCount: number;
	readonly failedCount: number;
	readonly skippedCount: number;
	readonly totalDuration: number;
	readonly averageDuration: number;
	readonly slowestTests: { readonly name: string; readonly duration: number }[];
}
