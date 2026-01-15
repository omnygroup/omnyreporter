/**
 * Diagnostic test helpers
 * @module tests/helpers/diagnostics
 */

import type { Diagnostic } from '../../src/core/types/index.js';

/**
 * Builder pattern for creating test diagnostics
 */
export class DiagnosticTestBuilder {
  private diagnostic: Diagnostic;

  constructor(id = 'test-1') {
    this.diagnostic = {
      id,
      source: 'eslint',
      filePath: '/test/file.ts',
      line: 1,
      column: 1,
      severity: 'error',
      code: 'TEST-001',
      message: 'Test message',
      timestamp: new Date(),
    };
  }

  withSource(source: 'eslint' | 'typescript' | 'vitest'): this {
    this.diagnostic = { ...this.diagnostic, source };
    return this;
  }

  withSeverity(severity: 'error' | 'warning' | 'info' | 'note'): this {
    this.diagnostic = { ...this.diagnostic, severity };
    return this;
  }

  withFilePath(filePath: string): this {
    this.diagnostic = { ...this.diagnostic, filePath };
    return this;
  }

  withMessage(message: string): this {
    this.diagnostic = { ...this.diagnostic, message };
    return this;
  }

  withCode(code: string): this {
    this.diagnostic = { ...this.diagnostic, code };
    return this;
  }

  withLocation(line: number, column: number, endLine?: number, endColumn?: number): this {
    this.diagnostic = { ...this.diagnostic, line, column, endLine, endColumn };
    return this;
  }

  build(): Diagnostic {
    return { ...this.diagnostic };
  }
}

export const mockDiagnosticBuilder = (id?: string): DiagnosticTestBuilder => new DiagnosticTestBuilder(id);
