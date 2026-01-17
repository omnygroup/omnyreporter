/**
 * Collect diagnostics use-case
 * Orchestrates collection from diagnostic sources
 * @module application/usecases/CollectDiagnostics
 */

import { injectable } from 'inversify';

import { DiagnosticError, ok, err, type IDiagnosticSource, type Diagnostic, type Result } from '@core';
import { type CollectionConfig, DiagnosticAggregator } from '@domain';
import { DirectoryService } from '@infrastructure/filesystem/index.js';

/**
 * Use-case for collecting diagnostics from multiple sources
 */
@injectable()
export class CollectDiagnosticsUseCase {
  public constructor(
    private readonly sources: readonly IDiagnosticSource[],
    private readonly aggregator: typeof DiagnosticAggregator,
    private readonly directoryService: DirectoryService
  ) {}

  /**
   * Execute diagnostic collection
   * Clears previous errors before collection
   * @param config Configuration for collection
   * @returns Result with collected diagnostics
   */
  public async execute(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    try {
      // Clear previous diagnostic errors
      await this.directoryService.clearAllErrors();

      const results = await Promise.allSettled(
        this.sources.map(async (source) => source.collect(config))
      );

      const diagnosticArrays: Diagnostic[][] = [];
      let successCount = 0;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value.isOk()) {
            diagnosticArrays.push([...value.value]);
            successCount += 1;
          }
        }
      }

      if (successCount === 0) {
        return err(new DiagnosticError('All diagnostic sources failed', { sources: this.sources.map((s) => s.getName()).join(', ') }));
      }

      const aggregated = this.aggregator.aggregate(diagnosticArrays);

      return ok(aggregated);
    } catch (error) {
      return err(
        new DiagnosticError(
          'Failed to collect diagnostics',
          { sources: this.sources.map((s) => s.getName()).join(', ') },
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}
