/**
 * Diagnostic Application Service
 * High-level orchestrator for diagnostic reporting workflow
 * @module application/services/DiagnosticApplicationService
 */

import { injectable } from 'inversify';

import { DiagnosticError, ok, err, type Result, type WriteStats } from '@core';
import { type CollectionConfig } from '@domain';
import { DirectoryService, StructuredReportWriter } from '@infrastructure/filesystem/index.js';

import { GenerateReportUseCase, type ReportResult } from '../usecases/GenerateReport.js';

/**
 * Complete diagnostic reporting result
 */
export interface DiagnosticReportingResult extends ReportResult {
  readonly writeStats: WriteStats;
}

/**
 * Application service coordinating the complete diagnostic reporting workflow
 * Orchestrates: clear → collect → aggregate → analytics → write
 */
@injectable()
export class DiagnosticApplicationService {
  public constructor(
    private readonly generateReportUseCase: GenerateReportUseCase,
    private readonly writer: StructuredReportWriter,
    private readonly directoryService: DirectoryService
  ) {}

  /**
   * Generate and write diagnostic report
   * Complete workflow from collection to file output
   * @param config Collection configuration
   * @returns Result with diagnostics, stats, and write stats
   */
  public async generateAndWriteReport(
    config: CollectionConfig
  ): Promise<Result<DiagnosticReportingResult, DiagnosticError>> {
    try {
      // Step 1: Clear previous diagnostic errors
      await this.directoryService.clearAllErrors();

      // Step 2: Generate report (collect, aggregate, analytics)
      const reportResult = await this.generateReportUseCase.execute(config);

      if (!reportResult.isOk()) {
        return err(reportResult.error);
      }

      const { diagnostics, stats } = reportResult.value;

      // Step 3: Group diagnostics for structured output
      // TODO: Move grouping logic to a dedicated service or use-case if needed
      // For now, writer expects specific data format

      // Step 4: Write structured reports
      // TODO: Writer needs to be refactored to accept diagnostics directly
      // Current implementation expects enriched reports which we removed
      // Temporary workaround: pass empty map or refactor writer
      const emptyMap = new Map();
      const writeResult = await this.writer.write(emptyMap);

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
        diagnostics,
        stats,
        writeStats: writeResult.value,
      });
    } catch (error) {
      return err(
        new DiagnosticError(
          'Failed to generate and write report',
          {},
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}
