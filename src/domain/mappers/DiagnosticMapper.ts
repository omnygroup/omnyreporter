/**
 * Diagnostic mapper
 * @module domain/mappers/DiagnosticMapper
 */

import { BaseMapper, createDiagnostic ,type  Diagnostic } from '../../core/index.js';

export interface RawDiagnosticData {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
  readonly severity: 'error' | 'warning' | 'info' | 'note';
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
  readonly source: 'eslint' | 'typescript' | 'vitest';
}

export interface PersistentDiagnosticData {
  readonly id: string;
  readonly source: 'eslint' | 'typescript' | 'vitest';
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
  readonly severity: 'error' | 'warning' | 'info' | 'note';
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
  readonly timestamp: string;
}

/**
 * Maps raw diagnostic data to Diagnostic type
 */
export class DiagnosticMapper extends BaseMapper<RawDiagnosticData, Diagnostic> {
  public map(input: RawDiagnosticData): Diagnostic {
    return createDiagnostic(
      input.source,
      input.filePath,
      input.line,
      input.column,
      input.severity,
      input.code,
      input.message,
      {
        endLine: input.endLine,
        endColumn: input.endColumn,
        detail: input.detail,
      }
    );
  }

  /**
   * Convert raw diagnostic data to domain model
   * @param input Raw diagnostic data
   * @returns Domain diagnostic
   */
  public static toDomain(input: Diagnostic): Diagnostic {
    return input;
  }

  /**
   * Convert domain diagnostic to JSON-serializable format
   * @param diagnostic Domain diagnostic
   * @returns Persistent diagnostic data
   */
  public static toPersistence(diagnostic: Diagnostic): PersistentDiagnosticData {
    return {
      id: diagnostic.id,
      source: diagnostic.source,
      filePath: diagnostic.filePath,
      line: diagnostic.line,
      column: diagnostic.column,
      endLine: diagnostic.endLine,
      endColumn: diagnostic.endColumn,
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
      detail: diagnostic.detail,
      timestamp: diagnostic.timestamp.toISOString(),
    };
  }

  /**
   * Reconstruct diagnostic from persisted JSON
   * @param data Persistent diagnostic data
   * @returns Domain diagnostic
   */
  public static fromPersistence(data: PersistentDiagnosticData): Diagnostic {
    // Reconstruct Diagnostic explicitly to preserve persisted id and timestamp
    const diagnostic: Diagnostic = {
      id: data.id,
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
      timestamp: new Date(data.timestamp),
    };

    return diagnostic;
  }
}
