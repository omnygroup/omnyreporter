/**
 * Diagnostic metadata builder
 * Calculates metadata from diagnostics
 * @module domain/analytics/diagnostics/DiagnosticMetadataBuilder
 */

import { type Diagnostic, type DiagnosticReportMetadata, type DiagnosticSource } from '@core';

import { DiagnosticAggregator } from './DiagnosticAggregator.js';

/**
 * Builds metadata for diagnostic reports
 * Pure function (no state, no dependencies)
 */
export const DiagnosticMetadataBuilder = Object.freeze({
  /**
   * Build metadata from diagnostics
   * @param diagnostics Array of diagnostics for single file
   * @param instrument Diagnostic source (tool)
   * @returns Report metadata
   */
  build(
    diagnostics: readonly Diagnostic[],
    instrument: DiagnosticSource
  ): DiagnosticReportMetadata {
    const severityCount = DiagnosticAggregator.countBySeverity(diagnostics);

    return {
      instrument,
      timestamp: new Date(),
      diagnosticCount: diagnostics.length,
      errorCount: severityCount.error,
      warningCount: severityCount.warning,
      infoCount: severityCount.info + severityCount.note,
    };
  },
});
