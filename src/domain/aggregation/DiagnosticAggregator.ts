/**
 * Diagnostic Aggregator
 * @module domain/aggregation/DiagnosticAggregator
 */

import { injectable } from 'inversify';

import { Diagnostic, type Result, type IDiagnosticAggregator } from '@core';

/**
 * Aggregates diagnostics from multiple sources
 */
@injectable()
export class DiagnosticAggregator implements IDiagnosticAggregator {
  public aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
    return sources.flat();
  }

  public aggregateResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: readonly Diagnostic[]; successCount: number } {
    const diagnostics: Diagnostic[] = [];
    let successCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.isOk()) {
        diagnostics.push(...result.value.value);
        successCount++;
      }
    }

    return { diagnostics, successCount };
  }
}
