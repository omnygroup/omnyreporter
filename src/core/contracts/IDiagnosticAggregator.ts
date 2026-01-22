/**
 * Diagnostic Aggregator interface
 * Contract for aggregating diagnostics from multiple sources
 * @module core/contracts/IDiagnosticAggregator
 */

import type { Diagnostic } from '@/core/types/diagnostic';
import type { Result } from '@core/types/result';

// TODO: Убрать I
export interface IDiagnosticAggregator {

  aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[];


  aggregateResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: readonly Diagnostic[]; successCount: number };
}
