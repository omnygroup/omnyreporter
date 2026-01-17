/**
 * Integration tests for GenerateReport use case
 * @module tests/integration/usecases/GenerateReport
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { GenerateReportUseCase } from '../../../src/application/usecases';
import { createTestConfig } from '../../helpers/index.js';
import { MockDiagnosticSource, MockDirectoryService, createTestDiagnostics } from '../../mocks';

import type { CollectionConfig } from '../../../src/domain/index.js';
import type { SourceCodeEnricher } from '../../../src/domain/mappers/SourceCodeEnricher';
import type { StructuredReportWriter } from '../../../src/infrastructure/filesystem/StructuredReportWriter';

describe('GenerateReportUseCase', () => {
  let useCase: GenerateReportUseCase;
  let mockSource: MockDiagnosticSource;
  let mockDirectoryService: MockDirectoryService;

  beforeEach(() => {
    mockSource = new MockDiagnosticSource('eslint');
    mockDirectoryService = new MockDirectoryService();

    const enricher = {
      enrichAll: vi.fn().mockResolvedValue({ isOk: () => true, value: new Map() }),
    } as unknown as SourceCodeEnricher;

    const writer = {
      write: vi.fn().mockResolvedValue({
        isOk: () => true,
        value: {
          filesWritten: 0,
          bytesWritten: 0,
          duration: 0,
          timestamp: new Date(),
        },
      }),
    } as unknown as StructuredReportWriter;

    useCase = new GenerateReportUseCase(
      [mockSource],
      enricher,
      writer,
      mockDirectoryService
    );
  });

  describe('execute', () => {
    it('should clear all errors before collection', async () => {
      const diagnostics = createTestDiagnostics(1, 'eslint');
      mockSource.setDiagnostics(diagnostics);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      expect(mockDirectoryService.wasClearedAll()).toBe(true);
    });

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
      };

      await useCase.execute(config);

      expect(mockSource.getCallCount()).toBe(1);
    });

    it('should clear errors even if sources fail', async (): Promise<void> => {
      mockSource.setError(new Error('Collection failed'));

      const config = createTestConfig();
      await useCase.execute(config);

      expect(mockDirectoryService.wasClearedAll()).toBe(true);
    });
  });
});
