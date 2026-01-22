/**
 * Validation module barrel export
 * @module domain/validation
 */

export { ConfigValidator } from './ConfigValidator.js';
export {
	CollectionConfigSchema,
	SanitizationConfigSchema,
	OmnyReporterConfigSchema,
	type CollectionConfig,
	type SanitizationConfig,
	type OmnyReporterConfig,
	type ReportingConfig,
	type OutputFormat,
} from './schemas/index.js';
