/**
 * Diagnostic analytics collector
 * @module domain/analytics/diagnostics/DiagnosticAnalytics
 */

import type { Diagnostic, DiagnosticStatistics } from '../../../core/index.js';
import { BaseAnalyticsCollector } from '../../../core/index.js';
import { StatisticsCalculator } from '../base/index.js';

/**
 * Analytics collector for diagnostics
 * Aggregates diagnostic data and calculates statistics
 */
export class DiagnosticAnalytics extends BaseAnalyticsCollector<
  Diagnostic,
  DiagnosticStatistics
> {
  private diagnostics: Diagnostic[] = [];

  public constructor() {
    super();
  }

  /**
   * Collect a single diagnostic and update statistics
   * @param diagnostic Single diagnostic to collect
   * @returns void
   */
  public collect(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    this.stats = StatisticsCalculator.calculateDiagnosticStats(this.diagnostics);
  }

  protected createInitialStats(): DiagnosticStatistics {
    return {
      timestamp: new Date(),
      totalCount: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      noteCount: 0,
      totalByFile: {},
      totalBySeverity: {
        error: 0,
        warning: 0,
        info: 0,
        note: 0,
      },
      totalByCode: {},
    };
  }

  /**
   * Get all collected diagnostics
   * @returns Array of diagnostics
   */
  public getDiagnostics(): readonly Diagnostic[] {
    return Object.freeze([...this.diagnostics]);
  }

  public override reset(): void {
    this.diagnostics = [];
    super.reset();
  }
}
