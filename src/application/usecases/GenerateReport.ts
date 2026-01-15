/**
 * Generate report use-case
 * Orchestrates diagnostic collection, aggregation, enrichment, and reporting
 * @module application/usecases/GenerateReport
 */

import { injectable } from 'inversify';

import { DiagnosticError, ok, err, type IDiagnosticSource, type Diagnostic, type Result, type WriteStats } from '@core';
import { type CollectionConfig, DiagnosticAnalytics, DiagnosticAggregator } from '@domain';
import { SourceCodeEnricher } from '@domain/mappers/index.js';
import { StructuredReportWriter } from '@infrastructure/filesystem/index.js';

/**
 * Result of report generation
 */
export interface ReportResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly stats: ReturnType<DiagnosticAnalytics['getSnapshot']>;
  readonly writeStats: WriteStats;
}

/**
 * Use-case for generating diagnostic reports
 */
@injectable()
export class GenerateReportUseCase {
  public constructor(
    private readonly sources: readonly IDiagnosticSource[],
    private readonly enricher: SourceCodeEnricher,
    private readonly writer: StructuredReportWriter
  ) {}

  /**
   * Execute report generation
   * @param config Collection configuration
   * @returns Result with report data
   */
  public async execute(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
    try {
      // Collect diagnostics from all sources
      const results = await Promise.allSettled(
        this.sources.map(async (source) => source.collect(config))
      );

      const diagnosticArrays: Diagnostic[][] = [];

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.isOk()) {
          diagnosticArrays.push([...result.value.value]);
        }
      }

      // Aggregate diagnostics
      const aggregated = DiagnosticAggregator.aggregate(diagnosticArrays);

      // Calculate statistics
      const analytics = new DiagnosticAnalytics();
      aggregated.forEach((d) => { analytics.collect(d); });
      const stats = analytics.getSnapshot();

      // Group by source and file
      const grouped = DiagnosticAggregator.groupBySourceAndFile(aggregated);

      // Filter empty groups
      const filtered = new Map(Array.from(grouped).filter(([, fileMap]) => fileMap.size > 0));

      // Enrich with source code
      const enrichResult = await this.enricher.enrichAll(filtered);

      if (!enrichResult.isOk()) {
        return err(
          new DiagnosticError(
            'Failed to enrich diagnostics',
            {},
            enrichResult.error instanceof Error ? enrichResult.error : undefined
          )
        );
      }

      // Write structured reports
      const writeResult = await this.writer.write(enrichResult.value);

      if (!writeResult.isOk()) {
        return err(
          new DiagnosticError(
            'Failed to write report',
            {},
            writeResult.error instanceof Error ? writeResult.error : undefined
          )
        );
      }

      return ok({
        diagnostics: aggregated,
        stats,
        writeStats: writeResult.value,
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

