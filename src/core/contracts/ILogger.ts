/**
 * Logger contract - single source of truth for logging interface
 * @module core/contracts/ILogger
 */

export type LogContext = Readonly<Record<string, unknown>>;

export interface ILogger {
	debug(message: string, context?: LogContext): void;
	info(message: string, context?: LogContext): void;
	warn(message: string, context?: LogContext): void;
	error(message: string, error?: Error | LogContext, context?: LogContext): void;
	child(context: LogContext): ILogger;
}
