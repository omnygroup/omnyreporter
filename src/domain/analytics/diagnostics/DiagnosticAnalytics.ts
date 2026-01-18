/**
 * Diagnostic analytics collector
 * @module domain/analytics/diagnostics/DiagnosticAnalytics
 */

import { BaseAnalyticsCollector, type Diagnostic, type DiagnosticStatistics } from '@core';

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
    this.stats = this.calculateStats(this.diagnostics);
  }

  /**
   * Collect multiple diagnostics at once
   * @param diagnostics Array of diagnostics to collect
   */
  public collectAll(diagnostics: readonly Diagnostic[]): void {
    this.diagnostics.push(...diagnostics);
    this.stats = this.calculateStats(this.diagnostics);
  }

  /**
   * Calculate statistics from diagnostics array
   * @param diagnostics Array of diagnostics
   * @returns Computed statistics
   */
  private calculateStats(diagnostics: readonly Diagnostic[]): DiagnosticStatistics {
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

    for (const d of diagnostics) {
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
    }

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
    return [...this.diagnostics];
  }

  public override reset(): void {
    this.diagnostics = [];
    super.reset();
  }
}
