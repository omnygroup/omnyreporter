/**
 * Dependency Injection Tokens
 * All tokens organized by domain within a single object
 * @module di/tokens
 */

/**
 * Core infrastructure tokens
 */
const CORE = {
  LOGGER: Symbol.for('ILogger'),
  FILE_SYSTEM: Symbol.for('IFileSystem'),
  PATH_SERVICE: Symbol.for('IPathService'),
  SANITIZER: Symbol.for('ISanitizer'),
} as const;

/**
 * Filesystem infrastructure tokens
 */
const FILESYSTEM = {
  DIRECTORY_SERVICE: Symbol.for('DirectoryService'),
  JSON_WRITER: Symbol.for('JsonWriter'),
  STREAM_WRITER: Symbol.for('StreamWriter'),
  FILE_WRITER: Symbol.for('FileWriter'),
  STRUCTURED_REPORT_WRITER: Symbol.for('StructuredReportWriter'),
} as const;

/**
 * Logging infrastructure tokens
 */
const LOGGING = {
  CONSOLE_LOGGER: Symbol.for('ConsoleLogger'),
} as const;

/**
 * Formatting infrastructure tokens
 */
const FORMATTING = {
  CONSOLE_FORMATTER: Symbol.for('ConsoleFormatter'),
  JSON_FORMATTER: Symbol.for('JsonFormatter'),
  TABLE_FORMATTER: Symbol.for('TableFormatter'),
} as const;

/**
 * Security infrastructure tokens
 */
const SECURITY = {
  PATH_VALIDATOR: Symbol.for('PathValidator'),
} as const;

/**
 * Analytics domain tokens
 */
const ANALYTICS = {
  DIAGNOSTIC_ANALYTICS: Symbol.for('DiagnosticAnalytics'),
  TYPESCRIPT_ANALYTICS: Symbol.for('TypeScriptAnalytics'),
} as const;

/**
 * Aggregation domain tokens
 */
const AGGREGATION = {
  DIAGNOSTIC_AGGREGATOR: Symbol.for('DiagnosticAggregator'),
} as const;

/**
 * Validation domain tokens
 */
const VALIDATION = {
  CONFIG_VALIDATOR: Symbol.for('ConfigValidator'),
} as const;

/**
 * Reporter tokens
 */
const REPORTERS = {
  ESLINT_ADAPTER: Symbol.for('EslintAdapter'),
  TYPESCRIPT_ADAPTER: Symbol.for('TypeScriptAdapter'),
  VITEST_ADAPTER: Symbol.for('VitestAdapter'),
  REPORTING_ORCHESTRATOR: Symbol.for('ReportingOrchestrator'),
  REPORTING_FACADE: Symbol.for('ReportingFacade'),
} as const;

/**
 * Application tokens
 */
const APPLICATION = {
  GENERATE_REPORT_USE_CASE: Symbol.for('GenerateReportUseCase'),
  DIAGNOSTIC_APPLICATION_SERVICE: Symbol.for('DiagnosticApplicationService'),
} as const;

/**
 * All DI tokens
 */
export const TOKENS = {
  ...CORE,
  ...FILESYSTEM,
  ...LOGGING,
  ...FORMATTING,
  ...SECURITY,
  ...ANALYTICS,
  ...AGGREGATION,
  ...VALIDATION,
  ...REPORTERS,
  ...APPLICATION,
} as const;
