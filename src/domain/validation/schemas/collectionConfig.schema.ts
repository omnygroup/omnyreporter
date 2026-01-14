/**
 * Collection config validation schema
 * @module domain/validation/schemas/collectionConfig.schema
 */

import { z } from 'zod';

/**
 * Schema for collection configuration
 */
export const CollectionConfigSchema = z.object({
  patterns: z
    .array(z.string())
    .min(1, 'At least one pattern is required')
    .describe('Glob patterns for files to lint'),

  rootPath: z
    .string()
    .optional()
    .describe('Root directory for collection'),

  concurrency: z
    .number()
    .int()
    .positive('Concurrency must be positive')
    .default(4)
    .describe('Number of concurrent operations'),

  timeout: z
    .number()
    .int()
    .positive('Timeout must be positive')
    .default(30000)
    .describe('Timeout in milliseconds'),

  cache: z
    .boolean()
    .default(false)
    .describe('Enable caching of results'),

  configPath: z
    .string()
    .optional()
    .describe('Path to config file'),

  ignorePatterns: z
    .array(z.string())
    .default([])
    .describe('Patterns to ignore'),

  eslint: z
    .boolean()
    .default(true)
    .describe('Enable ESLint checking'),

  typescript: z
    .boolean()
    .default(true)
    .describe('Enable TypeScript checking'),
});

export type CollectionConfig = z.infer<typeof CollectionConfigSchema>;
