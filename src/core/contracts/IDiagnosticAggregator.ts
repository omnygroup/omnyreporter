/**
 * Diagnostic Aggregator interface
 * Contract for aggregating diagnostics from multiple sources
 * @module core/contracts/IDiagnosticAggregator
 */

import type { Diagnostic } from '@core/types/diagnostic';
import type { Result } from '@core/types/result';

/**
 * Interface for diagnostic aggregation services
 * Provides methods to combine diagnostics from multiple sources
 */
export interface IDiagnosticAggregator {
  /**
   * Aggregate diagnostics from multiple arrays
   * @param sources Arrays of diagnostics from different collectors
   * @returns Combined array of all diagnostics
   */
  aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[];

  /**
   * Aggregate results from Promise.allSettled
   * Extracts successful diagnostic collections and flattens them
   * @param results PromiseSettledResult array from diagnostic collection
   * @returns Aggregated diagnostics and success count
   */
  aggregateResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: readonly Diagnostic[]; successCount: number };
}
