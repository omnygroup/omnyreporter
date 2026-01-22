import type { Diagnostic } from './Diagnostic.js';
import type { IntegrationName } from './DiagnosticIntegration.js';

/** Enriched diagnostic report with source code for AI agents */
export interface DiagnosticFileReport {
  /** Relative path from project root */
  readonly filePath: string;

  /** Absolute path to file */
  readonly absolutePath: string;

  /** Source code content */
  readonly sourceCode: string;

  /** File encoding */
  readonly encoding: string;

  /** Number of lines */
  readonly lineCount: number;

  /** File size in bytes */
  readonly size: number;

  /** Diagnostics for this file */
  readonly diagnostics: readonly Diagnostic[];

  /** Report metadata */
  readonly metadata: {
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
  };
}
