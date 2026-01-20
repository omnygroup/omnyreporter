/**
 * Tests for DiagnosticAggregator
 * @module tests/unit/domain/aggregation/DiagnosticAggregator
 */

import { ok, err } from 'neverthrow';
import { describe, it, expect, beforeEach } from 'vitest';

import { DiagnosticIntegration } from '../../../../src/core/types/diagnostic/index';
import { DiagnosticAggregator } from '../../../../src/domain/aggregation/DiagnosticAggregator';
import { createTestDiagnostics } from '../../../mocks/index';

describe('DiagnosticAggregator', () => {
  let aggregator: DiagnosticAggregator;

  beforeEach(() => {
    aggregator = new DiagnosticAggregator();
  });

  describe('aggregate', () => {
    it('should merge diagnostics from multiple sources', () => {
      const eslintDiags = createTestDiagnostics(2, 'eslint');
      const typescriptDiags = createTestDiagnostics(3, 'typescript');

      const result = aggregator.aggregate([eslintDiags, typescriptDiags]);

      expect(result).toHaveLength(5);
    });

    it('should preserve all diagnostic properties', () => {
      const eslintDiags = createTestDiagnostics(1, 'eslint');
      const result = aggregator.aggregate([eslintDiags]);

      const firstDiag = result[0];
      expect(firstDiag.id).toBeDefined();
      expect(firstDiag.source).toBe(DiagnosticIntegration.ESLint);
      expect(firstDiag.filePath).toBeDefined();
      expect(firstDiag.message).toBeDefined();
    });

    it('should handle empty arrays', () => {
      const result = aggregator.aggregate([]);
      expect(result).toHaveLength(0);
    });

    it('should handle multiple empty arrays', () => {
      const result = aggregator.aggregate([[], [], []]);
      expect(result).toHaveLength(0);
    });

    it('should preserve order within each source', () => {
      const diagnostics = createTestDiagnostics(3, 'eslint');
      const result = aggregator.aggregate([diagnostics]);

      expect(result[0].id).toBe(diagnostics[0].id);
      expect(result[1].id).toBe(diagnostics[1].id);
      expect(result[2].id).toBe(diagnostics[2].id);
    });
  });

  describe('aggregateResults', () => {
    it('should aggregate successful results', () => {
      const eslintDiags = createTestDiagnostics(2, 'eslint');
      const typescriptDiags = createTestDiagnostics(3, 'typescript');

      const results: PromiseSettledResult<{ isOk(): boolean; value: readonly typeof eslintDiags[number][] }>[] = [
        { status: 'fulfilled', value: ok(eslintDiags) },
        { status: 'fulfilled', value: ok(typescriptDiags) },
      ];

      const { diagnostics, successCount } = aggregator.aggregateResults(results);

      expect(diagnostics).toHaveLength(5);
      expect(successCount).toBe(2);
    });

    it('should skip failed results', () => {
      const eslintDiags = createTestDiagnostics(2, 'eslint');

      const results: PromiseSettledResult<{ isOk(): boolean; value?: readonly typeof eslintDiags[number][] }>[] = [
        { status: 'fulfilled', value: ok(eslintDiags) },
        { status: 'fulfilled', value: err(new Error('Failed')) },
      ];

      const { diagnostics, successCount } = aggregator.aggregateResults(results);

      expect(diagnostics).toHaveLength(2);
      expect(successCount).toBe(1);
    });

    it('should handle rejected promises', () => {
      const results: PromiseSettledResult<unknown>[] = [
        { status: 'rejected', reason: new Error('Promise rejected') },
      ];

      const { diagnostics, successCount } = aggregator.aggregateResults(results);

      expect(diagnostics).toHaveLength(0);
      expect(successCount).toBe(0);
    });
  });
});
