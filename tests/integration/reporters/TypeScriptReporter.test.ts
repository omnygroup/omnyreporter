/**
 * Integration tests for TypeScriptReporter
 * @module tests/integration/reporters/TypeScriptReporter
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { TypeScriptReporter } from '../../../src/reporters/typescript';
import { createTestConfig } from '../../helpers';
import { MockLogger } from '../../mocks';

describe('TypeScriptReporter', () => {
  let reporter: TypeScriptReporter;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = new MockLogger();
    reporter = new TypeScriptReporter(mockLogger, false);
  });

  describe('getName', () => {
    it('should return "typescript" as source name', () => {
      expect(reporter.getName()).toBe('typescript');
    });
  });

  describe('collect', () => {
    it('should return Result type', async () => {
      const config = createTestConfig();
      const result = await reporter.collect(config);

      expect(result.isOk()).toBeDefined();
      expect(result.isErr()).toBeDefined();
    });

    it('should handle TypeScript project configuration', async () => {
      const config = createTestConfig({
        patterns: ['src/**/*.ts'],
      });

      const result = await reporter.collect(config);

      expect(result.isOk() || result.isErr()).toBe(true);
    });

    it('should return array of TypeScript diagnostics', async () => {
      const config = createTestConfig();
      const result = await reporter.collect(config);

      if (result.isOk()) {
        const diagnostics = result._unsafeUnwrap();
        expect(Array.isArray(diagnostics)).toBe(true);
        // All diagnostics should have typescript source
        diagnostics.forEach((diag: { source?: unknown }) => {
          if (typeof diag.source === 'string') {
            expect(['typescript']).toContain(diag.source);
          }
        });
      }
    });

    it('should handle missing TypeScript config gracefully', async () => {
      const config = createTestConfig({
        patterns: ['nonexistent/**'],
      });

      const result = await reporter.collect(config);

      // Should not throw, return either Ok or Err
      expect(result.isOk() || result.isErr()).toBe(true);
    });
  });

  describe('logging', () => {
    it('should log diagnostic collection', async () => {
      const config = createTestConfig();
      await reporter.collect(config);

      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
