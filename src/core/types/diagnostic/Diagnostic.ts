import { IntegrationName } from './DiagnosticIntegration.js';

import type { DiagnosticSeverity } from './DiagnosticSeverity.js';

/**
 * Props for creating a Diagnostic
 */
export interface DiagnosticProps {
  readonly source: IntegrationName;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly severity: DiagnosticSeverity;
  readonly code: string;
  readonly message: string;
  readonly endLine?: number;
  readonly endColumn?: number;
  readonly detail?: string;
}

/**
 * Serialized format for persistence
 */
export interface PersistentDiagnostic {
  readonly id: string;
  readonly source: IntegrationName;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
  readonly severity: DiagnosticSeverity;
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
  readonly timestamp: string;
}

/**
 * Represents a single diagnostic issue
 * Immutable class for consistency across all diagnostic sources
 */
export class Diagnostic {
  public readonly id: string;
  public readonly source: IntegrationName;
  public readonly filePath: string;
  public readonly line: number;
  public readonly column: number;
  public readonly endLine?: number;
  public readonly endColumn?: number;
  public readonly severity: DiagnosticSeverity;
  public readonly code: string;
  public readonly message: string;
  public readonly detail?: string;
  public readonly timestamp: Date;

  public constructor(props: DiagnosticProps) {
    this.id = `${props.source}:${props.filePath}:${String(props.line)}:${String(props.column)}:${props.code}`;
    this.source = props.source;
    this.filePath = props.filePath;
    this.line = props.line;
    this.column = props.column;
    this.endLine = props.endLine;
    this.endColumn = props.endColumn;
    this.severity = props.severity;
    this.code = props.code;
    this.message = props.message;
    this.detail = props.detail;
    this.timestamp = new Date();
  }

  /**
   * Serialize to JSON-compatible format
   */
  public toJSON(): PersistentDiagnostic {
    return {
      id: this.id,
      source: this.source,
      filePath: this.filePath,
      line: this.line,
      column: this.column,
      endLine: this.endLine,
      endColumn: this.endColumn,
      severity: this.severity,
      code: this.code,
      message: this.message,
      detail: this.detail,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Reconstruct from persisted JSON
   */
  public static fromJSON(data: PersistentDiagnostic): Diagnostic {
    const diag = new Diagnostic({
      source: data.source,
      filePath: data.filePath,
      line: data.line,
      column: data.column,
      endLine: data.endLine,
      endColumn: data.endColumn,
      severity: data.severity,
      code: data.code,
      message: data.message,
      detail: data.detail,
    });
    // Override auto-generated timestamp with persisted value
    (diag as { timestamp: Date }).timestamp = new Date(data.timestamp);
    return diag;
  }
}
