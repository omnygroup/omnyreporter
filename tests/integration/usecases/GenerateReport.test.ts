/**
 * Integration tests for GenerateReport use case
 * @module tests/integration/usecases/GenerateReport
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { GenerateReportUseCase } from '../../../src/application/GenerateReportUseCase';
import { DiagnosticAggregator } from '../../../src/domain/aggregation/DiagnosticAggregator';
import { DiagnosticAnalytics } from '../../../src/domain/analytics/DiagnosticAnalytics';
import { createTestConfig } from '../../helpers/index.js';
import { MockDiagnosticSource, MockLogger, createTestDiagnostics } from '../../mocks';

import type { CollectionConfig } from '../../../src/domain/index.js';

describe('GenerateReportUseCase', () => {
  let useCase: GenerateReportUseCase;
  let mockSource: MockDiagnosticSource;
  let mockLogger: MockLogger;
  let aggregator: DiagnosticAggregator;
  let analytics: DiagnosticAnalytics;

  beforeEach(() => {
    mockSource = new MockDiagnosticSource('eslint');
    mockLogger = new MockLogger();
    aggregator = new DiagnosticAggregator();
    analytics = new DiagnosticAnalytics();

    useCase = new GenerateReportUseCase(
      [mockSource],
      aggregator,
      analytics,
      mockLogger
    );
  });

  describe('execute', () => {
    it('should collect diagnostics from sources', async () => {
      const diagnostics = createTestDiagnostics(3, 'eslint');
      mockSource.setDiagnostics(diagnostics);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      expect(mockSource.getCallCount()).toBe(1);
    });

    it('should handle empty diagnostics', async () => {
      mockSource.setDiagnostics([]);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.diagnostics).toHaveLength(0);
      }
    });

    it('should pass config to sources', async () => {
      mockSource.setDiagnostics(createTestDiagnostics(1, 'eslint'));

      const config: CollectionConfig = {
        patterns: ['custom/**/*.ts'],
        rootPath: process.cwd(),
        concurrency: 2,
        timeout: 5000,
        cache: true,
        ignorePatterns: ['node_modules'],
        eslint: true,
        typescript: false,
        configPath: undefined,
        verboseLogging: false,
      };

      await useCase.execute(config);

      expect(mockSource.getCallCount()).toBe(1);
    });

    it('should return statistics with diagnostics', async () => {
      const diagnostics = createTestDiagnostics(5, 'eslint');
      mockSource.setDiagnostics(diagnostics);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.stats).toBeDefined();
        expect(result.value.stats.totalCount).toBe(5);
        expect(result.value.sourceStats.successful).toBe(1);
      }
    });

    it('should return error when source fails', async () => {
      mockSource.setError(new Error('Collection failed'));

      const config = createTestConfig();
      const result = await useCase.execute(config);

      // All sources failed, should return error
      expect(result.isErr()).toBe(true);
    });
  });
});
