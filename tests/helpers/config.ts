/**
 * Test configuration helpers
 * @module tests/helpers/config
 */

import type { CollectionConfig } from '../../src/domain/index.js';

export function createTestConfig(overrides?: Partial<CollectionConfig>): CollectionConfig {
  return {
    patterns: ['src/**/*.ts'],
    ignorePatterns: ['dist/**', 'node_modules/**'],
    ...overrides,
  };
}
