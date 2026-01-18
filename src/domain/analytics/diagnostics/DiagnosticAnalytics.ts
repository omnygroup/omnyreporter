/**
 * Diagnostic Analytics
 * Collects and calculates diagnostic statistics
 * @module domain/analytics/diagnostics/DiagnosticAnalytics
 */

import { type Diagnostic, type DiagnosticStatistics } from '@core';

import { BaseAnalytics } from '../BaseAnalytics.js';

/**
 * Diagnostic analytics collector
 * Simple implementation for diagnostic statistics
 */
export class DiagnosticAnalytics extends BaseAnalytics<Diagnostic, DiagnosticStatistics> {
  private diagnostics: Diagnostic[] = [];

  public constructor() {
    super();
  }

  /**
   * Collect single diagnostic
   * @param input Diagnostic to collect
   */
  public collect(input: Diagnostic): void {
    this.diagnostics.push(input);
    this.recalculateStats();
  }

  /**
   * Collect multiple diagnostics
   * @param diagnostics Diagnostics array
   */
  public collectAll(diagnostics: readonly Diagnostic[]): void {
    this.diagnostics.push(...diagnostics);
    this.recalculateStats();
  }

  /**
   * Get collected diagnostics
   * @returns Diagnostics array
   */
  public getDiagnostics(): readonly Diagnostic[] {
    return [...this.diagnostics];
  }

  /**
   * Create initial statistics
   * @returns Initial stats
   */
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
   * Recalculate statistics
   */
  private recalculateStats(): void {
    this.stats = this.calculateStats(this.diagnostics);
  }

  /**
   * Calculate statistics
   * @param diagnostics Diagnostics array
   * @returns Statistics
   */
  private calculateStats(diagnostics: readonly Diagnostic[]): DiagnosticStatistics {
    const counts = this.countBySeverity(diagnostics);
    const byFile = this.countByFile(diagnostics);
    const byCode = this.countByCode(diagnostics);

    return {
      timestamp: new Date(),
      totalCount: diagnostics.length,
      errorCount: counts.error,
      warningCount: counts.warning,
      infoCount: counts.info,
      noteCount: counts.note,
      totalByFile: byFile,
      totalBySeverity: counts,
      totalByCode: byCode,
    };
  }

  /**
   * Count diagnostics by severity
   * @param diagnostics Diagnostics array
   * @returns Severity counts
   */
  private countBySeverity(diagnostics: readonly Diagnostic[]): Record<string, number> {
    const counts: Record<string, number> = {
      error: 0,
      warning: 0,
      info: 0,
      note: 0,
    };

    for (const diagnostic of diagnostics) {
      counts[diagnostic.severity] = (counts[diagnostic.severity] ?? 0) + 1;
    }

    return counts;
  }

  /**
   * Count diagnostics by file
   * @param diagnostics Diagnostics array
   * @returns File counts
   */
  private countByFile(diagnostics: readonly Diagnostic[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const diagnostic of diagnostics) {
      counts[diagnostic.filePath] = (counts[diagnostic.filePath] ?? 0) + 1;
    }

    return counts;
  }

  /**
   * Count diagnostics by code
   * @param diagnostics Diagnostics array
   * @returns Code counts
   */
  private countByCode(diagnostics: readonly Diagnostic[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const diagnostic of diagnostics) {
      counts[diagnostic.code] = (counts[diagnostic.code] ?? 0) + 1;
    }

    return counts;
  }
}
