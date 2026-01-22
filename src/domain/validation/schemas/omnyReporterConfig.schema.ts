/**
 * OmnyReporter project config validation schema
 * @module domain/validation/schemas/omnyReporterConfig.schema
 */

import { z } from 'zod';

import { CollectionConfigSchema } from './collectionConfig.schema.js';
import { SanitizationConfigSchema } from './sanitizationConfig.schema.js';

/**
 * Output format options
 */
const OutputFormatSchema = z.enum(['console', 'json', 'markdown', 'table']);

/**
 * Reporting configuration
 */
const ReportingConfigSchema = z.object({
	/** Output directory for reports */
	outputDir: z
		.string()
		.default('.omnyreporter')
		.describe('Output directory for generated reports'),

	/** Output formats to generate */
	formats: z
		.array(OutputFormatSchema)
		.default(['console'])
		.describe('Output formats for reports'),

	/** Include source code in reports */
	includeSource: z
		.boolean()
		.default(true)
		.describe('Include source code snippets in reports'),

	/** Timestamp format for reports */
	timestampFormat: z
		.string()
		.default('iso')
		.describe('Timestamp format (iso, unix, locale)'),
});

/**
 * Main OmnyReporter configuration schema
 * Loaded from omnyreporter.config.{js,ts,mjs,cjs} or .omnyrc
 */
export const OmnyReporterConfigSchema = z.object({
	/** Sanitization settings */
	sanitization: SanitizationConfigSchema.default({}),

	/** Collection settings (patterns, concurrency, etc.) */
	collection: CollectionConfigSchema.partial().default({}),

	/** Reporting settings */
	reporting: ReportingConfigSchema.default({}),

	/** Enable verbose logging */
	verbose: z
		.boolean()
		.default(false)
		.describe('Enable verbose logging output'),

	/** Quiet mode - suppress non-error output */
	quiet: z
		.boolean()
		.default(false)
		.describe('Suppress non-error output'),
});

export type OmnyReporterConfig = z.infer<typeof OmnyReporterConfigSchema>;
export type ReportingConfig = z.infer<typeof ReportingConfigSchema>;
export type OutputFormat = z.infer<typeof OutputFormatSchema>;
