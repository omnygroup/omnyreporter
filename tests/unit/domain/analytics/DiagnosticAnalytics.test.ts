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
    it('should return empty statistics for empty diagnostic list', async () => {
      const result = await analytics.collect([]);

      expect(result.isOk()).toBe(true);
      const stats = result._unsafeUnwrap();
      expect(stats.totalCount).toBe(0);
      expect(stats.errorCount).toBe(0);
    });

    it('should calculate correct statistics for mixed severity diagnostics', async () => {
      const diagnostics = [
        ...createTestDiagnostics(2, 'eslint').map((d) => ({ ...d, severity: 'error' as const })),
        ...createTestDiagnostics(3, 'eslint').map((d) => ({ ...d, severity: 'warning' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'info' as const })),
      ];

      const result = await analytics.collect(diagnostics);

      expect(result.isOk()).toBe(true);
      const stats = result._unsafeUnwrap();
      expect(stats.totalCount).toBe(6);
      expect(stats.errorCount).toBe(2);
      expect(stats.warningCount).toBe(3);
      expect(stats.infoCount).toBe(1);
    });

    it('should handle all severity levels', async () => {
      const diagnostics: Diagnostic[] = [
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'error' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'warning' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'info' as const })),
        ...createTestDiagnostics(1, 'eslint').map((d) => ({ ...d, severity: 'note' as const })),
      ];

      const result = await analytics.collect(diagnostics);

      expect(result.isOk()).toBe(true);
      const stats = result._unsafeUnwrap();
      expect(stats.errorCount).toBe(1);
      expect(stats.warningCount).toBe(1);
      expect(stats.infoCount).toBe(1);
      expect(stats.noteCount).toBe(1);
    });

    it('should include timestamp in statistics', async () => {
      const beforeTime = new Date();
      const result = await analytics.collect(createTestDiagnostics(1));
      const afterTime = new Date();

      const stats = result._unsafeUnwrap();
      expect(stats.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(stats.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should set source to eslint', async () => {
      const result = await analytics.collect(createTestDiagnostics(1, 'eslint'));

      const stats = result._unsafeUnwrap();
      expect(stats.source).toBe('eslint');
    });
  });
});
