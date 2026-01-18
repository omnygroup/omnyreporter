/**
 * Core types barrel export
 * @module core/types
 */

export type {
  Diagnostic,
  FileContent,
  DiagnosticReportMetadata,
  DiagnosticFileReport,
} from './diagnostic.js';
export { createDiagnostic } from './diagnostic.js';
export { DiagnosticSeverity } from './DiagnosticSeverity.js';
export { DiagnosticSource } from './DiagnosticSource.js';
export type { DiagnosticSeverity as DiagnosticSeverityType } from './diagnostic.js';
export type { DiagnosticSource as DiagnosticSourceType } from './diagnostic.js';

export type {
  StatisticsBase,
  DiagnosticStatistics,
  TestStatistics,
  StatisticsSnapshot,
} from './statistics.js';

export type {
  Result,
  Ok,
  Err,
} from './result.js';
export {
  ok,
  err,
} from './result.js';

export type {
  BaseConfig,
  FileOperationOptions,
  WriteOptions,
  WriteStats,
} from './config.js';
