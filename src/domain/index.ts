/**
 * Domain layer barrel export
 * Exports business logic, analytics, validation, and mappers
 * @module domain
 */

export { DiagnosticAnalytics } from './analytics/index.js';
export { DiagnosticAggregator } from './aggregation/index.js';

export {
  ConfigValidator,
  CollectionConfigSchema,
  ReportingConfigSchema,
  type CollectionConfig,
  type ReportingConfig,
} from './validation/index.js';

export { DiagnosticMapper, type RawDiagnosticData } from './mappers/index.js';
