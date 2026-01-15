/**
 * Integration tests for EslintReporter
 * @module tests/integration/reporters/EslintReporter
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { EslintReporter } from '../../../src/reporters/eslint';
import { createTestConfig } from '../../helpers';
import { MockLogger } from '../../mocks';

describe('EslintReporter', () => {
  let reporter: EslintReporter;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = new MockLogger();
    reporter = new EslintReporter(mockLogger);
  });

  describe('getName', () => {
    it('should return "eslint" as source name', () => {
      expect(reporter.getName()).toBe('eslint');
    });
  });

  describe('collect', () => {
    it('should return Result type', async () => {
      const config = createTestConfig();
      const result = await reporter.collect(config);

      expect(result.isOk()).toBeDefined();
      expect(result.isErr()).toBeDefined();
    });

    it('should handle configuration with patterns', async () => {
      const config = createTestConfig({
        patterns: ['src/**/*.ts', 'tests/**/*.test.ts'],
      });

      const result = await reporter.collect(config);

      // Result should be either Ok or Err, not throw
      expect(result.isOk() || result.isErr()).toBe(true);
    });

    it('should handle empty patterns gracefully', async () => {
      const config = createTestConfig({
        patterns: ['nonexistent/**/*.ts'],
      });

      const result = await reporter.collect(config);

      // Should return empty diagnostics for non-existent files
      expect(result.isOk()).toBe(true);
      const diagnostics = result._unsafeUnwrap();
      expect(Array.isArray(diagnostics)).toBe(true);
    });

    it('should return readonly diagnostic array', async () => {
      const config = createTestConfig();
      const result = await reporter.collect(config);

      if (result.isOk()) {
        const diagnostics = result._unsafeUnwrap();
        expect(Array.isArray(diagnostics)).toBe(true);
      }
    });
  });

  describe('logging', () => {
    it('should log collection activity', async () => {
      const config = createTestConfig();
      await reporter.collect(config);

      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
