/**
 * Diagnostics aggregator
 * Combines and processes diagnostics from multiple sources
 * @module domain/analytics/diagnostics/DiagnosticAggregator
 */

import { injectable } from 'inversify';

import type { Diagnostic, DiagnosticSource, DiagnosticStatistics, Result } from '@core';

export interface SeverityCount {
  readonly error: number;
  readonly warning: number;
  readonly info: number;
  readonly note: number;
}

export interface GroupedBySources {
  readonly eslint: readonly Diagnostic[];
  readonly typescript: readonly Diagnostic[];
  readonly vitest: readonly Diagnostic[];
}

/**
 * Diagnostic aggregator service
 * Central domain service for aggregating and processing diagnostics
 */
@injectable()
export class DiagnosticAggregator {
  /**
   * Aggregate diagnostics from multiple arrays
   * @param sources Arrays of diagnostics from different collectors
   * @returns Combined array of all diagnostics
   */
  public aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
    const results: Diagnostic[] = [];

    for (const source of sources) {
      results.push(...source);
    }

    return results;
  }

  /**
   * Aggregate results from Promise.allSettled
   * Extracts successful diagnostic collections and flattens them
   * @param results PromiseSettledResult array from diagnostic collection
   * @returns Aggregated diagnostics and success count
   */
  public aggregateResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: readonly Diagnostic[]; successCount: number } {
    const diagnosticArrays: Diagnostic[][] = [];
    let successCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.isOk()) {
        diagnosticArrays.push([...result.value.value]);
        successCount += 1;
      }
    }

    const aggregated = this.aggregate(diagnosticArrays);

    return { diagnostics: aggregated, successCount };
  }

  /**
   * Count diagnostics by severity level
   * @param diagnostics Array of diagnostics
   * @returns Count by each severity level
   */
  public countBySeverity(diagnostics: readonly Diagnostic[]): SeverityCount {
    let error = 0;
    let warning = 0;
    let info = 0;
    let note = 0;

    for (const diagnostic of diagnostics) {
      switch (diagnostic.severity) {
        case 'error':
          error++;
          break;
        case 'warning':
          warning++;
          break;
        case 'info':
          info++;
          break;
        case 'note':
          note++;
          break;
      }
    }

    return { error, warning, info, note };
  }

  /**
   * Calculate full diagnostic statistics
   * Merged from StatisticsCalculator to consolidate aggregation logic
   * @param diagnostics Array of diagnostics
   * @returns Complete diagnostic statistics
   */
  public calculateStatistics(diagnostics: readonly Diagnostic[]): DiagnosticStatistics {
    const severityCounts = this.countBySeverity(diagnostics);
    const totalByFile: Record<string, number> = {};
    const totalBySeverity: Record<string, number> = {
      error: severityCounts.error,
      warning: severityCounts.warning,
      info: severityCounts.info,
      note: severityCounts.note,
    };
    const totalByCode: Record<string, number> = {};

    for (const diagnostic of diagnostics) {
      // Count by file
      totalByFile[diagnostic.filePath] = (totalByFile[diagnostic.filePath] ?? 0) + 1;

      // Count by code
      totalByCode[diagnostic.code] = (totalByCode[diagnostic.code] ?? 0) + 1;
    }

    return {
      timestamp: new Date(),
      totalCount: diagnostics.length,
      errorCount: severityCounts.error,
      warningCount: severityCounts.warning,
      infoCount: severityCounts.info,
      noteCount: severityCounts.note,
      totalByFile,
      totalBySeverity,
      totalByCode,
    };
  }

  /**
   * Group diagnostics by source tool
   * @param diagnostics Array of diagnostics
   * @returns Diagnostics grouped by source
   */
  public groupBySource(diagnostics: readonly Diagnostic[]): GroupedBySources {
    const eslint: Diagnostic[] = [];
    const typescript: Diagnostic[] = [];
    const vitest: Diagnostic[] = [];

    for (const diagnostic of diagnostics) {
      switch (diagnostic.source) {
        case 'eslint':
          eslint.push(diagnostic);
          break;
        case 'typescript':
          typescript.push(diagnostic);
          break;
        case 'vitest':
          vitest.push(diagnostic);
          break;
      }
    }

    return { eslint, typescript, vitest };
  }

  /**
   * Filter diagnostics by severity level
   * @param diagnostics Array of diagnostics
   * @param severity Severity level to filter by
   * @returns Filtered diagnostics
   */
  public filterBySeverity(
    diagnostics: readonly Diagnostic[],
    severity: string
  ): readonly Diagnostic[] {
    return diagnostics.filter((d) => d.severity === severity);
  }

  /**
   * Filter diagnostics by file path
   * @param diagnostics Array of diagnostics
   * @param filePath File path to filter by
   * @returns Filtered diagnostics
   */
  public filterByFile(
    diagnostics: readonly Diagnostic[],
    filePath: string
  ): readonly Diagnostic[] {
    return diagnostics.filter((d) => d.filePath === filePath);
  }

  /**
   * Group diagnostics by file path
   * @param diagnostics Array of diagnostics
   * @returns Map of file path to diagnostics
   */
  public groupByFile(diagnostics: readonly Diagnostic[]): Map<string, readonly Diagnostic[]> {
    const grouped = new Map<string, Diagnostic[]>();

    for (const diagnostic of diagnostics) {
      const { filePath } = diagnostic;

      let fileDiagnostics = grouped.get(filePath);
      if (fileDiagnostics === undefined) {
        fileDiagnostics = [];
        grouped.set(filePath, fileDiagnostics);
      }

      fileDiagnostics.push(diagnostic);
    }

    return grouped;
  }

  /**
   * Group diagnostics by source and then by file
   * @param diagnostics Array of diagnostics
   * @returns Nested map of source to file to diagnostics
   */
  public groupBySourceAndFile(
    diagnostics: readonly Diagnostic[]
  ): Map<string, Map<string, readonly Diagnostic[]>> {
    const bySource = this.groupBySource(diagnostics);
    const result = new Map<string, Map<string, readonly Diagnostic[]>>();

    const sources = ['eslint', 'typescript', 'vitest'] as const;
    for (const source of sources) {
      const diags = bySource[source];
      const fileMap = this.groupByFile(diags);
      result.set(source, fileMap);
    }

    return result;
  }

  /**
   * Filter out empty diagnostic groups
   * @param grouped Map of source to file map
   * @returns Filtered map with only non-empty groups
   */
  public filterEmptyGroups(
    grouped: Map<string, Map<string, readonly Diagnostic[]>>
  ): Map<string, Map<string, readonly Diagnostic[]>> {
    const filtered = new Map<string, Map<string, readonly Diagnostic[]>>();

    for (const [source, fileMap] of grouped) {
      if (fileMap.size > 0) {
        filtered.set(source, fileMap);
      }
    }

    return filtered;
  }
}
