/**
 * Diagnostics aggregator
 * Combines diagnostics from multiple sources
 * @module domain/analytics/diagnostics/DiagnosticAggregator
 */

import type { Diagnostic, DiagnosticSource } from '@core';

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
 * Aggregates diagnostics from multiple sources
 */
export class DiagnosticAggregator {
  /**
   * Merge multiple diagnostic arrays
   * @param sources Multiple diagnostic arrays
   * @returns Merged diagnostics flattened into single array
   */
  public static aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
    const results: Diagnostic[] = [];

    for (const source of sources) {
      results.push(...source);
    }

    return Object.freeze(results);
  }

  /**
   * Count diagnostics by severity
   * @param diagnostics Diagnostics to count
   * @returns Severity counts
   */
  public static countBySeverity(diagnostics: readonly Diagnostic[]): SeverityCount {
    let error = 0;
    let warning = 0;
    let info = 0;
    let note = 0;

    for (const diagnostic of diagnostics) {
      if (diagnostic.severity === 'error') {
        error++;
      } else if (diagnostic.severity === 'warning') {
        warning++;
      } else if (diagnostic.severity === 'info') {
        info++;
      } else if (diagnostic.severity === 'note') {
        note++;
      }
    }

    return {
      error,
      warning,
      info,
      note,
    };
  }

  /**
   * Group diagnostics by source
   * @param diagnostics Diagnostics to group
   * @returns Grouped diagnostics by source
   */
  public static groupBySource(diagnostics: readonly Diagnostic[]): GroupedBySources {
    const eslint: Diagnostic[] = [];
    const typescript: Diagnostic[] = [];
    const vitest: Diagnostic[] = [];

    for (const diagnostic of diagnostics) {
      if (diagnostic.source === 'eslint') {
        eslint.push(diagnostic);
      } else if (diagnostic.source === 'typescript') {
        typescript.push(diagnostic);
      } else if (diagnostic.source === 'vitest') {
        vitest.push(diagnostic);
      }
    }

    return {
      eslint: Object.freeze(eslint),
      typescript: Object.freeze(typescript),
      vitest: Object.freeze(vitest),
    };
  }

  /**
   * Filter diagnostics by severity
   * @param diagnostics Diagnostics to filter
   * @param severity Severity to filter by
   * @returns Filtered diagnostics
   */
  public static filterBySeverity(
    diagnostics: readonly Diagnostic[],
    severity: string
  ): readonly Diagnostic[] {
    return Object.freeze(diagnostics.filter((d) => d.severity === severity));
  }

  /**
   * Filter diagnostics by file
   * @param diagnostics Diagnostics to filter
   * @param filePath File path to filter by
   * @returns Filtered diagnostics
   */
  public static filterByFile(
    diagnostics: readonly Diagnostic[],
    filePath: string
  ): readonly Diagnostic[] {
    return Object.freeze(diagnostics.filter((d) => d.filePath === filePath));
  }

  /**
   * Group diagnostics by file path
   * @param diagnostics Diagnostics to group
   * @returns Map of file path to diagnostics
   */
  public static groupByFile(
    diagnostics: readonly Diagnostic[]
  ): Map<string, readonly Diagnostic[]> {
    const grouped = new Map<string, Diagnostic[]>();

    for (const diagnostic of diagnostics) {
      const { filePath } = diagnostic;

      if (!grouped.has(filePath)) {
        grouped.set(filePath, []);
      }

      grouped.get(filePath)!.push(diagnostic);
    }

    // Freeze inner arrays
    for (const [, diags] of grouped) {
      Object.freeze(diags);
    }

    return grouped;
  }

  /**
   * Group diagnostics by source and then by file
   * @param diagnostics Diagnostics to group
   * @returns Map of source to map of file path to diagnostics
   */
  public static groupBySourceAndFile(
    diagnostics: readonly Diagnostic[]
  ): Map<DiagnosticSource, Map<string, readonly Diagnostic[]>> {
    const bySource = this.groupBySource(diagnostics);
    const result = new Map<DiagnosticSource, Map<string, readonly Diagnostic[]>>();

    for (const [source, diags] of Object.entries(bySource)) {
      const fileMap = this.groupByFile(diags);
      result.set(source as DiagnosticSource, fileMap);
    }

    return result;
  }
}
