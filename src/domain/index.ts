/**
 * Domain layer barrel export
 * @module domain
 */

export { DiagnosticAnalytics } from './analytics/DiagnosticAnalytics.js';

export { ConfigLoader } from './config/index.js';

export {
	ConfigValidator,
	CollectionConfigSchema,
	SanitizationConfigSchema,
	OmnyReporterConfigSchema,
	type CollectionConfig,
	type SanitizationConfig,
	type OmnyReporterConfig,
	type ReportingConfig,
	type OutputFormat,
} from './validation/index.js';

export { DiagnosticGrouper, FileReportBuilder } from './reporting/index.js';
