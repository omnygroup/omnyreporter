/**
 * Mock implementation of IDiagnosticSource for testing
 * @module tests/mocks/MockDiagnosticSource
 */

import type { Diagnostic, Result } from '../../src/core/types/index.js';
import type { IDiagnosticSource } from '../../src/core/contracts/index.js';
import type { CollectionConfig } from '../../src/domain/index.js';
import { ok, err } from 'neverthrow';

export class MockDiagnosticSource implements IDiagnosticSource {
  private name: string;
  private diagnosticsToReturn: Diagnostic[] = [];
  private errorToThrow: Error | null = null;
  private callCount = 0;

  constructor(name: string = 'mock-source') {
    this.name = name;
  }

  async collect(_config: CollectionConfig): Promise<Result<readonly Diagnostic[], Error>> {
    this.callCount++;
    if (this.errorToThrow) {
      return err(this.errorToThrow);
    }
    return ok(this.diagnosticsToReturn as readonly Diagnostic[]);
  }

  getName(): string {
    return this.name;
  }

  setDiagnostics(diagnostics: Diagnostic[]): void {
    this.diagnosticsToReturn = diagnostics;
  }

  setError(error: Error): void {
    this.errorToThrow = error;
  }

  clearError(): void {
    this.errorToThrow = null;
  }

  getCallCount(): number {
    return this.callCount;
  }

  resetCallCount(): void {
    this.callCount = 0;
  }
}
