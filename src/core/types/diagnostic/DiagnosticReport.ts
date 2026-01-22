import { Diagnostic } from './Diagnostic';

import type { IntegrationName } from './DiagnosticIntegration.js';

/** Diagnostic report containing all diagnostics for a project */
export interface DiagnosticReport {
  /** All diagnostics */
  readonly diagnostics: readonly Diagnostic[];

  /** Report metadata */
  readonly metadata: DiagnosticReportMetadata;
}

/** Metadata for diagnostic report */
export interface DiagnosticReportMetadata {
  /** Diagnostic integration (tool) */
  readonly instrument: IntegrationName;

  /** Report generation timestamp */
  readonly timestamp: Date;

  /** Total number of diagnostics */
  readonly diagnosticCount: number;

  /** Count of error severity */
  readonly errorCount: number;

  /** Count of warning severity */
  readonly warningCount: number;

  /** Count of info/note severity */
  readonly infoCount: number;
}
