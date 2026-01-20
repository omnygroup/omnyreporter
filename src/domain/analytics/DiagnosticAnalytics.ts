/**
 * Diagnostic Analytics
 * Collects and calculates diagnostic statistics
 * @module domain/analytics/DiagnosticAnalytics
 */

import { injectable } from 'inversify';

import { Diagnostic, type DiagnosticStatistics } from '@core';

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

  public collect(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    this.recalculate();
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

  public getDiagnostics(): readonly Diagnostic[] {
    return [...this.diagnostics];
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
    const d = this.diagnostics;
    const bySeverity = this.countBy(d, (x) => x.severity);

    this.stats = {
      timestamp: new Date(),
      totalCount: d.length,
      errorCount: bySeverity['error'] ?? 0,
      warningCount: bySeverity['warning'] ?? 0,
      infoCount: bySeverity['info'] ?? 0,
      noteCount: bySeverity['note'] ?? 0,
      totalByFile: this.countBy(d, (x) => x.filePath),
      totalBySeverity: {
        error: bySeverity['error'] ?? 0,
        warning: bySeverity['warning'] ?? 0,
        info: bySeverity['info'] ?? 0,
        note: bySeverity['note'] ?? 0,
      },
      totalByCode: this.countBy(d, (x) => x.code),
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
