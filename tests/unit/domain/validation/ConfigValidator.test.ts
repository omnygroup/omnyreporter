/**
 * Tests for ConfigValidator
 * @module tests/unit/domain/validation/ConfigValidator
 */

import { describe, it, expect } from 'vitest';
import { ConfigValidator } from '../../../../src/domain/validation/index.js';
import { createTestConfig } from '../../../helpers/index.js';

describe('ConfigValidator', () => {
  const validator = new ConfigValidator();

  describe('validate', () => {
    it('should accept valid configuration', () => {
      const config = createTestConfig();
      const result = validator.validate(config);

      expect(result.isOk()).toBe(true);
    });

    it('should accept config with custom patterns', () => {
      const config = createTestConfig({
        patterns: ['src/**/*.ts', 'tests/**/*.test.ts'],
      });
      const result = validator.validate(config);

      expect(result.isOk()).toBe(true);
    });

    it('should accept config with ignore patterns', () => {
      const config = createTestConfig({
        ignorePatterns: ['dist/**', 'coverage/**', 'node_modules/**'],
      });
      const result = validator.validate(config);

      expect(result.isOk()).toBe(true);
    });

    it('should reject config with missing patterns', () => {
      const invalidConfig = { ignorePatterns: [] } as any;
      const result = validator.validate(invalidConfig);

      expect(result.isErr()).toBe(true);
    });

    it('should reject empty patterns array', () => {
      const config = createTestConfig({ patterns: [] });
      const result = validator.validate(config);

      expect(result.isErr()).toBe(true);
    });

    it('should accept empty ignore patterns', () => {
      const config = createTestConfig({ ignorePatterns: [] });
      const result = validator.validate(config);

      expect(result.isOk()).toBe(true);
    });
  });

  describe('validateOrThrow', () => {
    it('should return config for valid input', () => {
      const config = createTestConfig();
      const result = validator.validateOrThrow(config);

      expect(result).toEqual(config);
    });

    it('should throw ValidationError for invalid input', () => {
      const invalidConfig = {} as any;

      expect(() => validator.validateOrThrow(invalidConfig)).toThrow();
    });
  });
});
