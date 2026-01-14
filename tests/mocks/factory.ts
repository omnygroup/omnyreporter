/**
 * Factory functions for creating test data
 * @module tests/mocks/factory
 */

import type { Diagnostic, Statistics } from '../../src/core/types/index.js';

export function createTestDiagnostic(overrides?: Partial<Diagnostic>): Diagnostic {
  return {
    id: 'test-diag-1',
    source: 'eslint',
    filePath: '/test/file.ts',
    line: 1,
    column: 1,
    severity: 'error',
    code: 'test-rule',
    message: 'Test diagnostic message',
    timestamp: new Date(),
    ...overrides,
  };
}

export function createTestStatistics(overrides?: Partial<Statistics>): Statistics {
  return {
    source: 'eslint',
    totalCount: 5,
    errorCount: 2,
    warningCount: 3,
    infoCount: 0,
    noteCount: 0,
    timestamp: new Date(),
    ...overrides,
  };
}

export function createTestDiagnostics(count: number, source: 'eslint' | 'typescript' | 'vitest' = 'eslint'): Diagnostic[] {
  return Array.from({ length: count }, (_, i) =>
    createTestDiagnostic({
      id: `test-diag-${i}`,
      source,
      filePath: `/test/file-${i}.ts`,
      line: i + 1,
      message: `Test diagnostic ${i}`,
    })
  );
}
