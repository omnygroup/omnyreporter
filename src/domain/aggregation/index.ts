/**
 * Aggregation module barrel export
 * @module domain/aggregation
 */

import { DiagnosticAggregator as _DiagnosticAggregator } from './DiagnosticAggregator.js';

import type { Diagnostic } from '@core';

export { _DiagnosticAggregator as DiagnosticAggregator };

// Backwards-compatible helpers used by older tests and callsites
export function aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
  return new _DiagnosticAggregator().aggregate(sources);
}

export function countBySeverity(diagnostics: readonly Diagnostic[]): { error: number; warning: number; info: number; note: number } {
  return {
    error: diagnostics.filter((d) => d.severity === 'error').length,
    warning: diagnostics.filter((d) => d.severity === 'warning').length,
    info: diagnostics.filter((d) => d.severity === 'info').length,
    note: diagnostics.filter((d) => d.severity === 'note').length,
  };
}

export function groupBySource(diagnostics: readonly Diagnostic[]): { eslint: Diagnostic[]; typescript: Diagnostic[]; vitest: Diagnostic[] } {
  return {
    eslint: diagnostics.filter((d) => d.source === 'eslint'),
    typescript: diagnostics.filter((d) => d.source === 'typescript'),
    vitest: diagnostics.filter((d) => d.source === 'vitest'),
  };
}
