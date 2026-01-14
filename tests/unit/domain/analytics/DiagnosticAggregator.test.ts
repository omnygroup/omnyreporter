/**
 * Tests for DiagnosticAggregator
 * @module tests/unit/domain/analytics/DiagnosticAggregator
 */

import { describe, it, expect } from 'vitest';
import { DiagnosticAggregator } from '../../../../src/domain/analytics/diagnostics/index.js';
import { createTestDiagnostics } from '../../../mocks/index.js';

describe('DiagnosticAggregator', () => {
  describe('aggregate', () => {
    it('should merge diagnostics from multiple sources', () => {
      const eslintDiags = createTestDiagnostics(2, 'eslint');
      const typescriptDiags = createTestDiagnostics(3, 'typescript');

      const result = DiagnosticAggregator.aggregate([eslintDiags, typescriptDiags]);

      expect(result).toHaveLength(5);
    });

    it('should preserve all diagnostic properties', () => {
      const eslintDiags = createTestDiagnostics(1, 'eslint');
      const result = DiagnosticAggregator.aggregate([eslintDiags]);

      const firstDiag = result[0];
      expect(firstDiag.id).toBeDefined();
      expect(firstDiag.source).toBe('eslint');
      expect(firstDiag.filePath).toBeDefined();
      expect(firstDiag.message).toBeDefined();
    });

    it('should handle empty arrays', () => {
      const result = DiagnosticAggregator.aggregate([]);
      expect(result).toHaveLength(0);
    });

    it('should handle multiple empty arrays', () => {
      const result = DiagnosticAggregator.aggregate([[], [], []]);
      expect(result).toHaveLength(0);
    });

    it('should preserve order within each source', () => {
      const diagnostics = createTestDiagnostics(3, 'eslint');
      const result = DiagnosticAggregator.aggregate([diagnostics]);

      expect(result[0].id).toBe(diagnostics[0].id);
      expect(result[1].id).toBe(diagnostics[1].id);
      expect(result[2].id).toBe(diagnostics[2].id);
    });
  });

  describe('countBySeverity', () => {
    it('should count diagnostics by severity', () => {
      const diagnostics = [
        ...createTestDiagnostics(2, 'eslint').map((d) => ({ ...d, severity: 'error' as const })),
        ...createTestDiagnostics(3, 'eslint').map((d) => ({ ...d, severity: 'warning' as const })),
      ];

      const counts = DiagnosticAggregator.countBySeverity(diagnostics);

      expect(counts.error).toBe(2);
      expect(counts.warning).toBe(3);
      expect(counts.info).toBe(0);
      expect(counts.note).toBe(0);
    });

    it('should return zero counts for empty array', () => {
      const counts = DiagnosticAggregator.countBySeverity([]);

      expect(counts.error).toBe(0);
      expect(counts.warning).toBe(0);
      expect(counts.info).toBe(0);
      expect(counts.note).toBe(0);
    });
  });

  describe('groupBySource', () => {
    it('should group diagnostics by source', () => {
      const eslintDiags = createTestDiagnostics(2, 'eslint');
      const typescriptDiags = createTestDiagnostics(1, 'typescript');
      const all = [...eslintDiags, ...typescriptDiags];

      const grouped = DiagnosticAggregator.groupBySource(all);

      expect(grouped.eslint).toHaveLength(2);
      expect(grouped.typescript).toHaveLength(1);
      expect(grouped.vitest).toHaveLength(0);
    });

    it('should return empty groups for empty array', () => {
      const grouped = DiagnosticAggregator.groupBySource([]);

      expect(grouped.eslint).toHaveLength(0);
      expect(grouped.typescript).toHaveLength(0);
      expect(grouped.vitest).toHaveLength(0);
    });
  });
});
