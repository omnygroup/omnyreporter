/**
 * Diagnostic Analytics
 * Collects and calculates diagnostic statistics
 * @module domain/analytics/DiagnosticAnalytics
 */

import { injectable } from 'inversify';

import { Diagnostic, type DiagnosticStatistics } from '@core';

/** Severity counts result */
export interface SeverityCounts {
	readonly errorCount: number;
	readonly warningCount: number;
	readonly infoCount: number;
}

/**
 * Diagnostic analytics collector
 */
@injectable()
export class DiagnosticAnalytics {
	private diagnostics: Diagnostic[] = [];
	private stats: DiagnosticStatistics;

	public constructor() {
		this.stats = this.createInitialStats();
	}

	/**
	 * Calculate severity counts for a list of diagnostics
	 * Static method for reuse across the codebase
	 */
	public static calculateSeverityCounts(diagnostics: readonly Diagnostic[]): SeverityCounts {
		let errorCount = 0;
		let warningCount = 0;
		let infoCount = 0;

		for (const diagnostic of diagnostics) {
			if (diagnostic.severity === 'error') {
				errorCount += 1;
			} else if (diagnostic.severity === 'warning') {
				warningCount += 1;
			} else {
				infoCount += 1;
			}
		}

		return { errorCount, warningCount, infoCount };
	}

	public collectAll(diagnostics: readonly Diagnostic[]): void {
		this.diagnostics.push(...diagnostics);
		this.recalculate();
	}

	public getSnapshot(): DiagnosticStatistics {
		return { ...this.stats };
	}

	public reset(): void {
		this.diagnostics = [];
		this.stats = this.createInitialStats();
	}

	private createInitialStats(): DiagnosticStatistics {
		return {
			timestamp: new Date(),
			totalCount: 0,
			errorCount: 0,
			warningCount: 0,
			infoCount: 0,
			noteCount: 0,
			totalByFile: {},
			totalBySeverity: { error: 0, warning: 0, info: 0, note: 0 },
			totalByCode: {},
		};
	}

	private recalculate(): void {
		const diagnostic = this.diagnostics;
		const bySeverity = this.countBy(diagnostic, (x) => x.severity);

		this.stats = {
			timestamp: new Date(),
			totalCount: diagnostic.length,
			errorCount: bySeverity['error'] ?? 0,
			warningCount: bySeverity['warning'] ?? 0,
			infoCount: bySeverity['info'] ?? 0,
			noteCount: bySeverity['note'] ?? 0,
			totalByFile: this.countBy(diagnostic, (x) => x.filePath),
			totalBySeverity: {
				error: bySeverity['error'] ?? 0,
				warning: bySeverity['warning'] ?? 0,
				info: bySeverity['info'] ?? 0,
				note: bySeverity['note'] ?? 0,
			},
			totalByCode: this.countBy(diagnostic, (x) => x.code),
		};
	}

	private countBy(items: readonly Diagnostic[], keyFn: (d: Diagnostic) => string): Record<string, number> {
		const result: Record<string, number> = {};
		for (const item of items) {
			const key = keyFn(item);
			result[key] = (result[key] ?? 0) + 1;
		}
		return result;
	}
}
