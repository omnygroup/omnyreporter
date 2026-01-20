/**
 * Domain layer barrel export
 * @module domain
 */

export { DiagnosticAnalytics } from './analytics/DiagnosticAnalytics.js';
export { DiagnosticAggregator } from './aggregation/DiagnosticAggregator.js';

export {
  ConfigValidator,
  CollectionConfigSchema,
  ReportingConfigSchema,
  type CollectionConfig,
  type ReportingConfig,
} from './validation/index.js';
