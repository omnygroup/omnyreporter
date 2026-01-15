/**
 * Generate report use-case
 * Orchestrates diagnostic collection, aggregation, and reporting
 * @module application/usecases/GenerateReport
 */

import { DiagnosticError, ok, err ,type 
  IDiagnosticSource,type 
  IWriter,type 
  Diagnostic,type 
  Result,type 
  WriteStats,
} from '../../core/index.js';
import { type CollectionConfig , DiagnosticAnalytics, DiagnosticAggregator } from '../../domain/index.js';

/**
 * Result of report generation
 */
export interface ReportResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly stats: ReturnType<DiagnosticAnalytics['getSnapshot']>;
  readonly writeStats?: WriteStats;
}

/**
 * Use-case for generating diagnostic reports
 */
export class GenerateReportUseCase {
  public constructor(
    private readonly sources: readonly IDiagnosticSource[],
    private readonly writer: IWriter<readonly Diagnostic[]>
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

      // Write report
      const writeResult = await this.writer.write(aggregated);

      if (!writeResult.isOk()) {
        // Return error if write failed
        return err(new DiagnosticError('Failed to write report', {}, writeResult.error instanceof Error ? writeResult.error : undefined));
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
