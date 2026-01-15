/**
 * Logger contract - single source of truth for logging interface
 * @module core/contracts/ILogger
 */

export type LogContext = Readonly<Record<string, unknown>>;

export interface ILogger {
  /**
   * Log debug level message
   * @param message Human-readable message
   * @param context Structured log context
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log info level message
   * @param message Human-readable message
   * @param context Structured log context
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log warning level message
   * @param message Human-readable message
   * @param context Structured log context
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log error level message
   * @param message Human-readable message
   * @param error Error object or context
   * @param context Additional context
   */
  error(message: string, error?: Error | LogContext, context?: LogContext): void;

  /**
   * Create a child logger with additional context
   * @param context Context to add to child logger
   * @returns New logger instance with context
   */
  child(context: LogContext): ILogger;
}
