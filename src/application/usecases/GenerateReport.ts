/**
 * Generate report use-case
 * Orchestrates diagnostic collection, aggregation, and analytics
 * @module application/usecases/GenerateReport
 */

import { injectable } from 'inversify';

import { DiagnosticError, ok, err, type IDiagnosticSource, type Diagnostic, type Result } from '@core';
import { type CollectionConfig } from '@domain';
import { DiagnosticAnalytics } from '@domain/analytics/diagnostics/index.js';
import { DiagnosticAggregator } from '@domain/aggregation/index.js';

/**
 * Result of report generation
 */
export interface ReportResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly stats: ReturnType<DiagnosticAnalytics['getSnapshot']>;
}

/**
 * Use-case for generating diagnostic reports
 * Returns data without writing - writing handled by ApplicationService
 */
@injectable()
export class GenerateReportUseCase {
  public constructor(
    private readonly sources: readonly IDiagnosticSource[],
    private readonly aggregator: DiagnosticAggregator,
    private readonly analytics: DiagnosticAnalytics
  ) {}

  /**
   * Execute report generation
   * Collects diagnostics from sources, aggregates, and calculates statistics
   * @param config Collection configuration
   * @returns Result with diagnostics and statistics
   */
  public async execute(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
    try {
      // Collect diagnostics from all sources
      const results = await Promise.allSettled(
        this.sources.map(async (source) => source.collect(config))
      );

      // Aggregate successful results
      const { diagnostics: aggregated, successCount } = this.aggregator.aggregateResults(results);

      // Check if all sources failed
      if (successCount === 0) {
        return err(
          new DiagnosticError(
            'All diagnostic sources failed',
            { sources: this.sources.map((s) => s.getName()).join(', ') }
          )
        );
      }

      // Calculate statistics
      this.analytics.reset();
      this.analytics.collectAll(aggregated);
      const stats = this.analytics.getSnapshot();

      return ok({
        diagnostics: aggregated,
        stats,
      });
    } catch (error) {
      return err(
        new DiagnosticError(
          'Failed to generate report',
          {},
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

