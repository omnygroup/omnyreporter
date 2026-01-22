/**
 * Validation schemas barrel export
 * @module domain/validation/schemas
 */

export { CollectionConfigSchema, type CollectionConfig } from './collectionConfig.schema.js';
export { SanitizationConfigSchema, type SanitizationConfig } from './sanitizationConfig.schema.js';
export {
	OmnyReporterConfigSchema,
	type OmnyReporterConfig,
	type ReportingConfig,
	type OutputFormat,
} from './omnyReporterConfig.schema.js';
