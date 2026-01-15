/**
 * TypeScript analytics collector
 * @module domain/analytics/typescript/TypeScriptAnalytics
 */

import { injectable } from 'inversify';

import { BaseAnalyticsCollector ,type  Diagnostic } from '../../../core/index.js';

import { TypeScriptStatisticsCalculator } from './TypeScriptStatisticsCalculator.js';

import type { TypeScriptStatistics } from './types.js';

/**
 * Analytics collector for TypeScript diagnostics
 * Aggregates compiler diagnostics and calculates TypeScript-specific statistics
 */
@injectable()
export class TypeScriptAnalytics extends BaseAnalyticsCollector<Diagnostic, TypeScriptStatistics> {
  private diagnostics: Diagnostic[] = [];

  public constructor() {
    super();
  }

  /**
   * Collect a single TypeScript diagnostic and update statistics
   * @param diagnostic Single diagnostic to collect
   */
  public collect(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    this.stats = TypeScriptStatisticsCalculator.calculateTypeScriptStats(this.diagnostics);
  }

  protected createInitialStats(): TypeScriptStatistics {
    return {
      timestamp: new Date(),
      totalCount: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      filesWithErrors: {},
      totalByCode: {},
      mostCommonErrorCodes: [],
    };
  }

  /**
   * Get all collected TypeScript diagnostics
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

