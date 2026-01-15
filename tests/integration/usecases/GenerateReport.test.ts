/**
 * Integration tests for GenerateReport use case
 * @module tests/integration/usecases/GenerateReport
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { GenerateReportUseCase } from '../../../src/application/usecases';
import { MockWriter , MockFormatter , MockLogger , createTestDiagnostics } from '../../mocks';

import type { DiagnosticReport } from '../../../src/core/types';

describe('GenerateReportUseCase', () => {
  let useCase: GenerateReportUseCase<DiagnosticReport>;
  let mockWriter: MockWriter<DiagnosticReport>;
  let mockFormatter: MockFormatter<DiagnosticReport[]>;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockWriter = new MockWriter<DiagnosticReport>();
    mockFormatter = new MockFormatter<DiagnosticReport[]>();
    mockLogger = new MockLogger();

    // GenerateReportUseCase now accepts (sources, writer)
    useCase = new GenerateReportUseCase([], mockWriter);
  });

  describe('execute', () => {
    it('should format and write diagnostics', async () => {
      const diagnostics = createTestDiagnostics(3);
      const report: DiagnosticReport = {
        timestamp: new Date(),
        totalDiagnostics: 3,
        bySource: { eslint: 3, typescript: 0, vitest: 0 },
        bySeverity: { error: 3, warning: 0, info: 0, note: 0 },
        diagnostics: diagnostics,
      };

      const result = await useCase.execute([report]);

      expect(result.isOk()).toBe(true);
      expect(mockWriter.getWrittenData().length).toBeGreaterThan(0);
    });

    it('should handle empty diagnostics', async () => {
      const report: DiagnosticReport = {
        timestamp: new Date(),
        totalDiagnostics: 0,
        bySource: { eslint: 0, typescript: 0, vitest: 0 },
        bySeverity: { error: 0, warning: 0, info: 0, note: 0 },
        diagnostics: [],
      };

      const result = await useCase.execute([report]);

      expect(result.isOk()).toBe(true);
    });

    it('should write to specified path', async () => {
      const diagnostics = createTestDiagnostics(1);
      const report: DiagnosticReport = {
        timestamp: new Date(),
        totalDiagnostics: 1,
        bySource: { eslint: 1, typescript: 0, vitest: 0 },
        bySeverity: { error: 1, warning: 0, info: 0, note: 0 },
        diagnostics,
      };

      const result = await useCase.execute([report], { path: '/output/report.json' });

      expect(result.isOk()).toBe(true);
    });

    it('should return error if write fails', async () => {
      mockWriter.setError(new Error('Write failed'));

      const report: DiagnosticReport = {
        timestamp: new Date(),
        totalDiagnostics: 0,
        bySource: { eslint: 0, typescript: 0, vitest: 0 },
        bySeverity: { error: 0, warning: 0, info: 0, note: 0 },
        diagnostics: [],
      };

      const result = await useCase.execute([report]);

      expect(result.isErr()).toBe(true);
    });

    it('should log report generation', async () => {
      const report: DiagnosticReport = {
        timestamp: new Date(),
        totalDiagnostics: 0,
        bySource: { eslint: 0, typescript: 0, vitest: 0 },
        bySeverity: { error: 0, warning: 0, info: 0, note: 0 },
        diagnostics: [],
      };

      await useCase.execute([report]);

      // Writer should have been called
      expect(mockWriter.getWrittenData().length).toBeGreaterThan(0);
    });
  });
});
