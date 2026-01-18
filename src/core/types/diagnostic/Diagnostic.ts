import type { DiagnosticIntegration } from './DiagnosticIntegration.js';
import type { DiagnosticSeverity } from './DiagnosticSeverity.js';

/**
 * Represents a single diagnostic issue
 * Immutable structure for consistency across all diagnostic sources
 */
export interface Diagnostic {
  /** Unique identifier for the diagnostic */
  readonly id: string;

  /** Integration tool that generated this diagnostic */
  readonly source: DiagnosticIntegration;

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
