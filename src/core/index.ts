/**
 * Core layer barrel export
 * Exports types, contracts, abstractions, and errors
 * @module core
 */

// Types
export type {
  DiagnosticProps,
  PersistentDiagnostic,
  DiagnosticSeverity,
  DiagnosticReportMetadata,
  DiagnosticFileReport,
  StatisticsBase,
  DiagnosticStatistics,
  TestStatistics,
  StatisticsSnapshot,
  Result,
  Ok,
  Err,
  BaseConfig,
  FileOperationOptions,
  WriteOptions,
  WriteStats,
} from './types/index.js';

export {
  Diagnostic,
  IntegrationName,
  ok,
  err,
} from './types/index.js';

// Contracts
export type {
  ILogger,
  LogContext,
  IFileSystem,
  IPathService,
  ISanitizer,
  IFormatter,
  IWriter,
  DiagnosticIntegration,
  IDiagnosticAggregator,
  IAnalyticsCollector,
} from './contracts/index.js';

// Errors
export type { ErrorContext } from './errors/index.js';
export {
  BaseError,
  ConfigurationError,
  ValidationError,
  FileSystemError,
  DiagnosticError,
} from './errors/index.js';

// Utils
export {
  isError,
  isString,
  isObject,
  isArray,
  isNumber,
  isBoolean,
  isNullish,
  isNotNullish,
  assertNotNullish,
  assertTrue,
  assertType,
} from './utils/index.js';

// Abstractions
export { BaseReportGenerator } from './abstractions/index.js';
