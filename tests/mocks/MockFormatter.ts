/**
 * Mock implementation of IFormatter for testing
 * @module tests/mocks/MockFormatter
 */

import type { IFormatter } from '../../src/core/contracts/index.js';

export class MockFormatter<TInput, TOutput = string> implements IFormatter<TInput, TOutput> {
  private formatCallCount = 0;

  format(input: TInput): TOutput {
    this.formatCallCount++;
    return JSON.stringify(input) as unknown as TOutput;
  }

  getFormatCallCount(): number {
    return this.formatCallCount;
  }

  resetCallCount(): void {
    this.formatCallCount = 0;
  }
}
