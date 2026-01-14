/**
 * Integration tests for CollectDiagnostics use case
 * @module tests/integration/usecases/CollectDiagnostics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CollectDiagnosticsUseCase } from '../../../../src/application/usecases/index.js';
import { MockDiagnosticSource } from '../../../mocks/MockDiagnosticSource.js';
import { MockLogger } from '../../../mocks/MockLogger.js';
import { createTestConfig, createTestDiagnostics } from '../../../mocks/index.js';

describe('CollectDiagnosticsUseCase', () => {
  let useCase: CollectDiagnosticsUseCase;
  let mockEslint: MockDiagnosticSource;
  let mockTypescript: MockDiagnosticSource;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockEslint = new MockDiagnosticSource('eslint');
    mockTypescript = new MockDiagnosticSource('typescript');
    mockLogger = new MockLogger();

    useCase = new CollectDiagnosticsUseCase([mockEslint, mockTypescript], mockLogger);
  });

  describe('execute', () => {
    it('should collect diagnostics from all sources', async () => {
      const eslintDiags = createTestDiagnostics(2, 'eslint');
      const typescriptDiags = createTestDiagnostics(3, 'typescript');

      mockEslint.setDiagnostics(eslintDiags);
      mockTypescript.setDiagnostics(typescriptDiags);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      const diagnostics = result._unsafeUnwrap();
      expect(diagnostics).toHaveLength(5);
    });

    it('should handle errors from individual sources gracefully', async () => {
      mockEslint.setDiagnostics(createTestDiagnostics(1, 'eslint'));
      mockTypescript.setError(new Error('TypeScript failed'));

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      const diagnostics = result._unsafeUnwrap();
      expect(diagnostics).toHaveLength(1);
    });

    it('should log collection activity', async () => {
      mockEslint.setDiagnostics(createTestDiagnostics(1, 'eslint'));

      const config = createTestConfig();
      await useCase.execute(config);

      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should call all sources with same config', async () => {
      mockEslint.setDiagnostics([]);
      mockTypescript.setDiagnostics([]);

      const config = createTestConfig({ patterns: ['custom/**'] });
      await useCase.execute(config);

      expect(mockEslint.getCallCount()).toBe(1);
      expect(mockTypescript.getCallCount()).toBe(1);
    });

    it('should return empty array when all sources return empty', async () => {
      mockEslint.setDiagnostics([]);
      mockTypescript.setDiagnostics([]);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      const diagnostics = result._unsafeUnwrap();
      expect(diagnostics).toHaveLength(0);
    });

    it('should return error if all sources fail', async () => {
      const error = new Error('Collection failed');
      mockEslint.setError(error);
      mockTypescript.setError(new Error('Also failed'));

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isErr()).toBe(true);
    });
  });
});
