/**
 * Collect diagnostics use-case
 * Orchestrates collection from diagnostic sources
 * @module application/usecases/CollectDiagnostics
 */

import type { IDiagnosticSource, Diagnostic } from '../../core/index.js';
import { DiagnosticError, ok, err } from '../../core/index.js';
import type { Result } from '../../core/index.js';
import type { CollectionConfig } from '../../domain/index.js';
import { DiagnosticAggregator } from '../../domain/index.js';

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
        this.sources.map((source) => source.collect(config))
      );

      const diagnosticArrays: Diagnostic[][] = [];

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value.isOk && value.isOk()) {
            diagnosticArrays.push([...value.value]);
          }
        }
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
