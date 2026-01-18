/**
 * Diagnostic Aggregator
 * Aggregates diagnostics from multiple sources
 * @module domain/aggregation/DiagnosticAggregator
 */

import { injectable } from 'inversify';

import type { Diagnostic, Result } from '@core';
import type { IDiagnosticAggregator } from '@core/contracts/IDiagnosticAggregator';

/**
 * Diagnostic aggregator
 * Simple aggregation of diagnostic results
 */
@injectable()
export class DiagnosticAggregator implements IDiagnosticAggregator {
  /**
   * Aggregate diagnostic arrays
   * @param sources Diagnostic arrays
   * @returns Combined diagnostics
   */
  public aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
    const results: Diagnostic[] = [];

    for (const source of sources) {
      results.push(...source);
    }

    return results;
  }

  /**
   * Aggregate Promise.allSettled results
   * @param results Promise results
   * @returns Aggregated diagnostics and success count
   */
  public aggregateResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: readonly Diagnostic[]; successCount: number } {
    const successful = this.extractSuccessfulResults(results);
    const diagnostics = this.aggregate(successful.diagnostics);

    return {
      diagnostics,
      successCount: successful.count,
    };
  }

  /**
   * Extract successful results
   * @param results Promise results
   * @returns Successful diagnostics and count
   */
  private extractSuccessfulResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: Diagnostic[][]; count: number } {
    const diagnostics: Diagnostic[][] = [];
    let count = 0;

    for (const result of results) {
      if (this.isSuccessfulResult(result)) {
        diagnostics.push([...result.value.value]);
        count += 1;
      }
    }

    return { diagnostics, count };
  }

  /**
   * Check if result is successful
   * @param result Promise result
   * @returns True if successful
   */
  private isSuccessfulResult(
    result: PromiseSettledResult<Result<readonly Diagnostic[], Error>>
  ): result is PromiseFulfilledResult<Result<readonly Diagnostic[], Error>> {
    return result.status === 'fulfilled' && result.value.isOk();
  }
}
