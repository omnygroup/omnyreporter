/**
 * Mock implementation of IWriter for testing
 * @module tests/mocks/MockWriter
 */

import type { IWriter } from '../../src/core/contracts/index.js';
import type { WriteStats, Result } from '../../src/core/types/index.js';
import { ok, err } from 'neverthrow';

export class MockWriter<TData> implements IWriter<TData> {
  private writtenData: TData[] = [];
  private errorToThrow: Error | null = null;

  async write(data: TData): Promise<Result<WriteStats, Error>> {
    if (this.errorToThrow) {
      return err(this.errorToThrow);
    }
    this.writtenData.push(data);
    return ok({ bytesWritten: JSON.stringify(data).length, path: 'mock-path' });
  }

  getWrittenData(): TData[] {
    return this.writtenData;
  }

  setError(error: Error): void {
    this.errorToThrow = error;
  }

  clearError(): void {
    this.errorToThrow = null;
  }

  clear(): void {
    this.writtenData = [];
  }
}
