/**
 * Dependency Injection Tokens
 * All tokens organized by domain within a single object
 * @module di/tokens
 *
 * Token Organization:
 * - CORE: Core infrastructure interfaces (ILogger, IFileSystem, etc.)
 * - FILESYSTEM: Filesystem services (writers, directory service)
 * - LOGGING: Logger implementations
 * - FORMATTING: Formatter implementations
 * - SECURITY: Security services (path validation, sanitization)
 * - ANALYTICS: Domain analytics services
 * - AGGREGATION: Diagnostic aggregation services
 * - VALIDATION: Configuration validation services
 * - REPORTERS: Diagnostic source reporters (ESLint, TypeScript, Vitest)
 * - APPLICATION: Application layer services (use cases, app services)
 *
 * Note: All tokens must have corresponding bindings in register*.ts files
 */

// ============================================================================
// INFRASTRUCTURE LAYER
// ============================================================================

/**
 * Core infrastructure tokens - Primary interfaces
 * @see registerLogging.ts, registerFilesystem.ts, registerPaths.ts, registerSecurity.ts
 */
const CORE = {
  /** Primary application logger (ILogger interface) */
  LOGGER: Symbol.for('ILogger'),
  /** File system abstraction (IFileSystem interface) */
  FILE_SYSTEM: Symbol.for('IFileSystem'),
  /** Path manipulation service (IPathService interface) */
  PATH_SERVICE: Symbol.for('IPathService'),
  /** Data sanitization service (ISanitizer interface) */
  SANITIZER: Symbol.for('ISanitizer'),
  /** Base path for file operations (defaults to cwd) */
  BASE_PATH: Symbol.for('BasePath'),
} as const;

/**
 * Filesystem infrastructure tokens - File operations
 * @see registerFilesystem.ts
 */
const FILESYSTEM = {
  /** Directory operations service */
  DIRECTORY_SERVICE: Symbol.for('DirectoryService'),
  /** JSON file writer */
  JSON_WRITER: Symbol.for('JsonWriter'),
  /** Stream-based file writer */
  STREAM_WRITER: Symbol.for('StreamWriter'),
  /** General file writer */
  FILE_WRITER: Symbol.for('FileWriter'),
  /** Structured report writer with directory management */
  STRUCTURED_REPORT_WRITER: Symbol.for('StructuredReportWriter'),
} as const;

/**
 * Logging infrastructure tokens - Logger implementations
 * @see registerLogging.ts
 */
const LOGGING = {
  /** Console logger implementation (alternative to PinoLogger) */
  CONSOLE_LOGGER: Symbol.for('ConsoleLogger'),
} as const;

/**
 * Formatting infrastructure tokens - Output formatters
 * @see registerFormatting.ts
 */
const FORMATTING = {
  /** Console output formatter */
  CONSOLE_FORMATTER: Symbol.for('ConsoleFormatter'),
  /** JSON output formatter */
  JSON_FORMATTER: Symbol.for('JsonFormatter'),
  /** Table output formatter */
  TABLE_FORMATTER: Symbol.for('TableFormatter'),
} as const;

/**
 * Security infrastructure tokens - Security services
 * @see registerSecurity.ts
 */
const SECURITY = {
  /** Path traversal validator */
  PATH_VALIDATOR: Symbol.for('PathValidator'),
} as const;

// ============================================================================
// DOMAIN LAYER
// ============================================================================

/**
 * Analytics domain tokens - Statistical analysis services
 * @see registerAnalytics.ts
 */
const ANALYTICS = {
  /** Diagnostic statistics calculator */
  DIAGNOSTIC_ANALYTICS: Symbol.for('DiagnosticAnalytics'),
} as const;

/**
 * Aggregation domain tokens - Data aggregation services
 * @see registerAggregation.ts
 */
const AGGREGATION = {
  /** Diagnostic data aggregator (IDiagnosticAggregator interface) */
  DIAGNOSTIC_AGGREGATOR: Symbol.for('DiagnosticAggregator'),
} as const;

/**
 * Validation domain tokens - Configuration validation
 * @see registerValidation.ts
 */
const VALIDATION = {
  /** Configuration validator (zod-based) */
  CONFIG_VALIDATOR: Symbol.for('ConfigValidator'),
} as const;

// ============================================================================
// REPORTERS (DIAGNOSTIC INTEGRATIONS)
// ============================================================================

/**
 * Reporter tokens - DiagnosticIntegration implementations
 * Each implements DiagnosticIntegration interface
 * @see registerReporters.ts
 */
const REPORTERS = {
  /** ESLint diagnostic reporter */
  ESLINT_REPORTER: Symbol.for('EslintReporter'),
  /** TypeScript diagnostic reporter */
  TYPESCRIPT_REPORTER: Symbol.for('TypeScriptReporter'),
  /** Vitest test reporter adapter */
  VITEST_ADAPTER: Symbol.for('VitestAdapter'),
  /** Multi-inject token for all diagnostic integrations */
  DIAGNOSTIC_INTEGRATION: Symbol.for('DiagnosticIntegration'),
} as const;

// ============================================================================
// APPLICATION LAYER
// ============================================================================

/**
 * Application tokens - Use cases and application services
 * @see registerApplication.ts
 */
const APPLICATION = {
  /** Main report generation use case */
  GENERATE_REPORT_USE_CASE: Symbol.for('GenerateReportUseCase'),
  /** Diagnostic application service facade */
  DIAGNOSTIC_APPLICATION_SERVICE: Symbol.for('DiagnosticApplicationService'),
} as const;

// ============================================================================
// EXPORTED TOKEN REGISTRY
// ============================================================================

/**
 * All DI tokens combined
 * Use: TOKENS.TOKEN_NAME to access individual symbols
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
