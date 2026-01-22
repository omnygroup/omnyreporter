/**
 * Generate report use-case
 * Orchestrates diagnostic collection, aggregation, and analytics
 * @module application/GenerateReportUseCase
 */

import { injectable, multiInject, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import { DiagnosticError, ok, err, type DiagnosticIntegration, type IDiagnosticAggregator, type Diagnostic, type DiagnosticStatistics, type Result, type ILogger } from '@core';
import { type CollectionConfig } from '@domain';
import { DiagnosticAnalytics } from '@domain/analytics/DiagnosticAnalytics.js';

/**
 * Source statistics
 */
export interface SourceStatistics {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly timedOut: number;
}

/**
 * Result of report generation
 */
export interface ReportResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly stats: DiagnosticStatistics;
  readonly sourceStats: SourceStatistics;
}

/**
 * Use-case for generating diagnostic reports
 * Returns data without writing - writing handled by ApplicationService
 *
 * Dependencies:
 * - sources: Diagnostic sources (ESLint, TypeScript reporters)
 * - aggregator: Combines results from multiple sources (uses IDiagnosticAggregator interface)
 * - analytics: Calculates statistics (uses DiagnosticAnalytics for collectAll batch method)
 */
@injectable()
export class GenerateReportUseCase {
  public constructor(
    @multiInject(TOKENS.DIAGNOSTIC_INTEGRATION) private readonly sources: DiagnosticIntegration[],
    @inject(TOKENS.DIAGNOSTIC_AGGREGATOR) private readonly aggregator: IDiagnosticAggregator,
    @inject(TOKENS.DIAGNOSTIC_ANALYTICS) private readonly analytics: DiagnosticAnalytics,
    @inject(TOKENS.LOGGER) private readonly logger: ILogger
  ) {}

  /**
   * Execute report generation
   * Collects diagnostics from sources, aggregates, and calculates statistics
   * @param config Collection configuration
   * @returns Result with diagnostics and statistics
   */
  public async execute(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
    try {
      // Filter sources based on configuration
      const activeSources = this.filterActiveSources(config);

      if (activeSources.length === 0) {
        return err(
          new DiagnosticError(
            'No diagnostic sources enabled',
            { config: { eslint: config.eslint, typescript: config.typescript } }
          )
        );
      }

      this.logger.info('Collecting diagnostics from sources', {
        sources: activeSources.map((s) => s.getName()),
        total: activeSources.length,
      });

      // Collect diagnostics from all active sources with timeout
      const results = await Promise.allSettled(
        activeSources.map(async (source) => this.collectWithTimeout(source, config))
      );

      // Track timeout statistics
      let timedOutCount = 0;
      for (const result of results) {
        if (
          result.status === 'rejected' &&
          result.reason instanceof Error &&
          result.reason.message.includes('timeout')
        ) {
          timedOutCount += 1;
        }
      }

      // Aggregate successful results
      const { diagnostics: aggregated, successCount } = this.aggregator.aggregateResults(results);

      // Check if all sources failed
      if (successCount === 0) {
        return err(
          new DiagnosticError(
            'All diagnostic sources failed',
            { sources: activeSources.map((s) => s.getName()).join(', ') }
          )
        );
      }

      this.logger.info('Diagnostic collection completed', {
        collected: aggregated.length,
        successful: successCount,
        failed: activeSources.length - successCount,
        timedOut: timedOutCount,
      });

      // Calculate statistics
      this.analytics.reset();
      this.analytics.collectAll(aggregated);
      const stats = this.analytics.getSnapshot();

      return ok({
        diagnostics: aggregated,
        stats,
        sourceStats: {
          total: activeSources.length,
          successful: successCount,
          failed: activeSources.length - successCount,
          timedOut: timedOutCount,
        },
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

  /**
   * Filter sources based on configuration flags
   * @param config Collection configuration
   * @returns Active sources
   */
  private filterActiveSources(config: CollectionConfig): readonly DiagnosticIntegration[] {
    return this.sources.filter((source) => {
      const name = source.getName().toLowerCase();

      // Check ESLint flag
      if (name.includes('eslint')) {
        return !config.eslint ? false : true;
      }

      // Check TypeScript flag
      if (name.includes('typescript')) {
        return !config.typescript ? false : true;
      }

      // Include other sources (vitest, etc.) by default
      return true;
    });
  }

  /**
   * Collect diagnostics from source with timeout
   * @param source Diagnostic source
   * @param config Collection configuration
   * @returns Promise that resolves with Result or rejects on timeout
   */
  private async collectWithTimeout(
    source: DiagnosticIntegration,
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    const timeout = config.timeout;
    const hasTimeout = timeout > 0;

    if (!hasTimeout) {
      return source.collect(config);
    }

    return Promise.race([
      source.collect(config),
      this.createTimeoutPromise(timeout, source.getName()),
    ]);
  }

  /**
   * Create timeout promise that rejects after specified duration
   * @param ms Timeout in milliseconds
   * @param sourceName Source name for error message
   * @returns Promise that rejects on timeout
   */
  private async createTimeoutPromise(
    ms: number,
    sourceName: string
  ): Promise<never> {
    return new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new DiagnosticError(
            `Source ${sourceName} timed out after ${String(ms)}ms`,
            { source: sourceName, timeout: ms }
          )
        );
      }, ms);
    });
  }
}
