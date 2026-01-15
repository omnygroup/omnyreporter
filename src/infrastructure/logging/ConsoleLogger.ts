/**
 * Console-based logger implementation
 * Uses native console.* methods to provide structured, simple logging
 * @module infrastructure/logging/ConsoleLogger
 */

import { injectable } from 'inversify';

import type { ILogger, LogContext } from '../../core/index.js';

/**
 * ConsoleLogger - lightweight console logger implementing ILogger
 * Provides structured logging by serializing context to JSON and
 * using native console methods (debug/info/warn/error).
 */
@injectable()
export class ConsoleLogger implements ILogger {
  private readonly context: LogContext;

  public constructor(context: LogContext = {}) {
    this.context = context;
  }

  /**
   * Format message with merged context
   * @param message Human readable message
   * @param ctx Optional per-call context
   * @returns Formatted message string
   */
  private format(message: string, ctx?: LogContext): string {
    const merged: LogContext = { ...this.context, ...(ctx ?? {}) };
    const ctxStr: string = Object.keys(merged).length ? ` ${JSON.stringify(merged)}` : '';
    return `${message}${ctxStr}`;
  }

  public debug(message: string, context?: LogContext): void {
    console.debug(this.format(message, context));
  }

  public info(message: string, context?: LogContext): void {
    console.info(this.format(message, context));
  }

  public warn(message: string, context?: LogContext): void {
    console.warn(this.format(message, context));
  }

  public error(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (error instanceof Error) {
      const merged: LogContext = { ...this.context, ...(context ?? {}) };
      const ctxStr: string = Object.keys(merged).length ? ` ${JSON.stringify(merged)}` : '';
      // Include stack when available to aid debugging
      console.error(`${message}${ctxStr} - ${error.stack ?? error.message}`);
    } else {
      console.error(this.format(message, (error!) ?? context));
    }
  }

  public child(context: LogContext): ILogger {
    return new ConsoleLogger({ ...this.context, ...(context ?? {}) });
  }
}

