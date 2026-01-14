/**
 * Tests for DiagnosticAnalytics
 * @module tests/unit/domain/analytics/DiagnosticAnalytics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DiagnosticAnalytics } from '../../../../src/domain/analytics/diagnostics/index.js';
import { createTestDiagnostics } from '../../../mocks/index.js';
import type { Diagnostic } from '../../../../src/core/types/index.js';

describe('DiagnosticAnalytics', () => {
  let analytics: DiagnosticAnalytics;

  beforeEach(() => {
    analytics = new DiagnosticAnalytics();
  });

  describe('collect', () => {
    it('should return empty statistics for empty diagnostic list', () => {
      const stats = analytics.getSnapshot();

      expect(stats.totalCount).toBe(0);
      expect(stats.errorCount).toBe(0);
    });

    it('should calculate correct statistics for mixed severity diagnostics', () => {
      const diagnostics = [
        ...createTestDiagnostics(2, 'eslint').map((d) => ({ ...d, severity: 'error' as const })),
        ...createTestDiagnostics(3, 'eslint').map((d) => ({ ...d, severity: 'warning' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'info' as const })),
      ];

      diagnostics.forEach((d) => analytics.collect(d));

      const stats = analytics.getSnapshot();
      expect(stats.totalCount).toBe(6);
      expect(stats.errorCount).toBe(2);
      expect(stats.warningCount).toBe(3);
      expect(stats.infoCount).toBe(1);
    });

    it('should handle all severity levels', () => {
      const diagnostics: Diagnostic[] = [
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'error' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'warning' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'info' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'note' as const })),
      ];

      diagnostics.forEach((d) => analytics.collect(d));

      const stats = analytics.getSnapshot();
      expect(stats.errorCount).toBe(1);
      expect(stats.warningCount).toBe(1);
      expect(stats.infoCount).toBe(1);
      expect(stats.noteCount).toBe(1);
    });

    it('should include timestamp in statistics', () => {
      const beforeTime = new Date();
      analytics.collect(createTestDiagnostics(1)[0]);
      const afterTime = new Date();

      const stats = analytics.getSnapshot();
      expect(stats.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(stats.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should set source to eslint on collected diagnostics', () => {
      analytics.collect(createTestDiagnostics(1, 'eslint')[0]);

      const collected = analytics.getDiagnostics();
      expect(collected[0].source).toBe('eslint');
    });
  });
});
