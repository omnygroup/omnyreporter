/**
 * Lint analytics collector
 * @module domain/analytics/lint/LintAnalytics
 */

import { BaseAnalyticsCollector ,type  Diagnostic } from '../../../core/index.js';

import { LintStatisticsCalculator } from './LintStatisticsCalculator.js';

import type { LintStatistics } from './types.js';

/**
 * Analytics collector for linting diagnostics
 * Provides lint-specific metrics like rule frequency and auto-fixable issues
 */
export class LintAnalytics extends BaseAnalyticsCollector<Diagnostic, LintStatistics> {
  private diagnostics: Diagnostic[] = [];

  public constructor() {
    super();
  }

  public collect(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    this.stats = LintStatisticsCalculator.calculateLintStats(this.diagnostics);
  }

  protected createInitialStats(): LintStatistics {
    return {
      timestamp: new Date(),
      totalCount: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      noteCount: 0,
      autoFixableCount: 0,
      mostCommonRules: [],
      filesByRule: {},
    };
  }

  /**
   * Get all collected linting diagnostics
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
