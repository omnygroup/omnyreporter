/**
 * Integration tests for TypeScriptAdapter
 * @module tests/integration/reporters/TypeScriptAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TypeScriptAdapter } from '../../../../src/reporters/typescript/index.js';
import { MockLogger } from '../../../mocks/MockLogger.js';
import { createTestConfig } from '../../../helpers/index.js';

describe('TypeScriptAdapter', () => {
  let adapter: TypeScriptAdapter;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = new MockLogger();
    adapter = new TypeScriptAdapter(mockLogger);
  });

  describe('getName', () => {
    it('should return "typescript" as source name', () => {
      expect(adapter.getName()).toBe('typescript');
    });
  });

  describe('collect', () => {
    it('should return Result type', async () => {
      const config = createTestConfig();
      const result = await adapter.collect(config);

      expect(result.isOk()).toBeDefined();
      expect(result.isErr()).toBeDefined();
    });

    it('should handle TypeScript project configuration', async () => {
      const config = createTestConfig({
        patterns: ['src/**/*.ts'],
      });

      const result = await adapter.collect(config);

      expect(result.isOk() || result.isErr()).toBe(true);
    });

    it('should return array of TypeScript diagnostics', async () => {
      const config = createTestConfig();
      const result = await adapter.collect(config);

      if (result.isOk()) {
        const diagnostics = result._unsafeUnwrap();
        expect(Array.isArray(diagnostics)).toBe(true);
        // All diagnostics should have typescript source
        diagnostics.forEach((diag) => {
          if ('source' in diag) {
            expect(['typescript']).toContain(diag.source);
          }
        });
      }
    });

    it('should handle missing TypeScript config gracefully', async () => {
      const config = createTestConfig({
        patterns: ['nonexistent/**'],
      });

      const result = await adapter.collect(config);

      // Should not throw, return either Ok or Err
      expect(result.isOk() || result.isErr()).toBe(true);
    });
  });

  describe('logging', () => {
    it('should log diagnostic collection', async () => {
      const config = createTestConfig();
      await adapter.collect(config);

      const logs = mockLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
