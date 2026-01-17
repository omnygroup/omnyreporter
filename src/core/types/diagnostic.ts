/**
 * Core diagnostic type representing a single issue found by linters or type checkers
 * @module core/types/diagnostic
 */

/** Severity level of a diagnostic */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'note';

/** Source of the diagnostic (ESLint, TypeScript, Vitest, etc.) */
export type DiagnosticSource = 'eslint' | 'typescript' | 'vitest';

/**
 * Represents a single diagnostic issue
 * Immutable structure for consistency across all diagnostic sources
 */
export interface Diagnostic {
  /** Unique identifier for the diagnostic */
  readonly id: string;

  /** Source tool that generated this diagnostic */
  readonly source: DiagnosticSource;

  /** File path (absolute or relative) where the issue occurs */
  readonly filePath: string;

  /** Line number (1-based) */
  readonly line: number;

  /** Column number (1-based) */
  readonly column: number;

  /** End line for range-based diagnostics */
  readonly endLine?: number;

  /** End column for range-based diagnostics */
  readonly endColumn?: number;

  /** Severity level */
  readonly severity: DiagnosticSeverity;

  /** Rule/error code (e.g., 'no-unused-vars', 'TS2322') */
  readonly code: string;

  /** Human-readable message */
  readonly message: string;

  /** Detailed message (optional) */
  readonly detail?: string;

  /** Suggested fix (optional) */
  readonly fix?: {
    readonly description: string;
    readonly replacement: string;
  };

  /** Timestamp when diagnostic was created */
  readonly timestamp: Date;
}

/** File content with metadata */
export interface FileContent {
  /** Absolute path to file */
  readonly absolutePath: string;

  /** Relative path from project root */
  readonly relativePath: string;

  /** Source code content */
  readonly sourceCode: string;

  /** File encoding */
  readonly encoding: string;

  /** Number of lines in file */
  readonly lineCount: number;

  /** File size in bytes */
  readonly size: number;
}

/** Metadata for diagnostic report */
export interface DiagnosticReportMetadata {
  /** Diagnostic source (tool) */
  readonly instrument: DiagnosticSource;

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
  readonly metadata: DiagnosticReportMetadata;
}

/** Factory function to create a Diagnostic */
export function createDiagnostic(
  source: DiagnosticSource,
  filePath: string,
  line: number,
  column: number,
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  options?: Partial<Omit<Diagnostic, 'id' | 'source' | 'filePath' | 'line' | 'column' | 'severity' | 'code' | 'message' | 'timestamp'>>
): Diagnostic {
  const id = `${source}:${filePath}:${String(line)}:${String(column)}:${code}`;

  return {
    id,
    source,
    filePath,
    line,
    column,
    severity,
    code,
    message,
    timestamp: new Date(),
    ...options,
  };
}
