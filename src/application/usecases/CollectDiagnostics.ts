/**
 * Collect diagnostics use-case
 * Orchestrates collection from diagnostic sources
 * @module application/usecases/CollectDiagnostics
 */

import { DiagnosticError, ok, err ,type  IDiagnosticSource,type  Diagnostic ,type  Result } from '../../core/index.js';
import { type CollectionConfig , DiagnosticAggregator } from '../../domain/index.js';

/**
 * Use-case for collecting diagnostics from multiple sources
 */
export class CollectDiagnosticsUseCase {
  public constructor(
    private readonly sources: readonly IDiagnosticSource[],
    private readonly aggregator: typeof DiagnosticAggregator
  ) {}

  /**
   * Execute diagnostic collection
   * @param config Configuration for collection
   * @returns Result with collected diagnostics
   */
  public async execute(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    try {
      const results = await Promise.allSettled(
        this.sources.map(async (source) => source.collect(config))
      );

      const diagnosticArrays: Diagnostic[][] = [];
      let successCount = 0;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value && typeof value.isOk === 'function' && value.isOk()) {
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
