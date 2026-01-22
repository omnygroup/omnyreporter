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
	DiagnosticFileReport,
	StatisticsBase,
	DiagnosticStatistics,
	TestStatistics,
	Result,
	Ok,
	Err,
	FileOperationOptions,
	WriteOptions,
	WriteStats,
} from './types/index.js';

export { Diagnostic, IntegrationName, ok, err } from './types/index.js';

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
} from './contracts/index.js';

// Errors
export type { ErrorContext } from './errors/index.js';
export { BaseError, ConfigurationError, ValidationError, FileSystemError, DiagnosticError } from './errors/index.js';

// Abstractions
export { BaseReportGenerator } from './abstractions/index.js';
