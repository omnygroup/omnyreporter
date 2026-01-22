/**
 * Tests for DiagnosticAnalytics
 * @module tests/unit/domain/analytics/DiagnosticAnalytics
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { IntegrationName } from '../../../../src/core/types/diagnostic/index';
import { DiagnosticAnalytics } from '../../../../src/domain/analytics/DiagnosticAnalytics';
import { createTestDiagnostic, createTestDiagnostics } from '../../../mocks/index';

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
      // Create diagnostics with different severities
      const errors = [
        createTestDiagnostic({ severity: 'error' }),
        createTestDiagnostic({ severity: 'error' }),
      ];
      const warnings = [
        createTestDiagnostic({ severity: 'warning' }),
        createTestDiagnostic({ severity: 'warning' }),
        createTestDiagnostic({ severity: 'warning' }),
      ];
      const infos = [createTestDiagnostic({ severity: 'info' })];

      const allDiagnostics = [...errors, ...warnings, ...infos];
      allDiagnostics.forEach((d) => {
        analytics.collect(d);
      });

      const stats = analytics.getSnapshot();
      expect(stats.totalCount).toBe(6);
      expect(stats.errorCount).toBe(2);
      expect(stats.warningCount).toBe(3);
      expect(stats.infoCount).toBe(1);
    });

    it('should handle all severity levels', () => {
      analytics.collect(createTestDiagnostic({ severity: 'error' }));
      analytics.collect(createTestDiagnostic({ severity: 'warning' }));
      analytics.collect(createTestDiagnostic({ severity: 'info' }));
      analytics.collect(createTestDiagnostic({ severity: 'note' }));

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

    it('should set source to ESLint on collected diagnostics', () => {
      analytics.collect(createTestDiagnostics(1, 'eslint')[0]);

      const collected = analytics.getDiagnostics();
      expect(collected[0].source).toBe(IntegrationName.ESLint);
    });
  });

  describe('collectAll', () => {
    it('should collect multiple diagnostics at once', () => {
      const diagnostics = createTestDiagnostics(5, 'eslint');
      analytics.collectAll(diagnostics);

      const stats = analytics.getSnapshot();
      expect(stats.totalCount).toBe(5);
    });
  });

  describe('reset', () => {
    it('should clear all collected diagnostics', () => {
      analytics.collectAll(createTestDiagnostics(5, 'eslint'));
      expect(analytics.getSnapshot().totalCount).toBe(5);

      analytics.reset();

      expect(analytics.getSnapshot().totalCount).toBe(0);
      expect(analytics.getDiagnostics()).toHaveLength(0);
    });
  });
});
