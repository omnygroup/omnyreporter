/**
 * Pino-based logger implementation
 * Single consolidated logger for the entire application
 * @module infrastructure/logging/PinoLogger
 */

import { injectable } from 'inversify';
import pino, { type Logger as PinoLoggerType } from 'pino';

import type { ILogger, LogContext } from '../../core/index.js';

/**
 * Logger implementation using Pino
 * Provides structured logging with context support
 */
@injectable()
export class PinoLogger implements ILogger {
  private readonly logger: PinoLoggerType;

  public constructor(options?: { name?: string; level?: string }) {
    this.logger = pino({
      name: options?.name ?? 'omnyreporter',
      level: options?.level ?? 'info',
      transport:
        process.env['NODE_ENV'] === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  public error(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (error instanceof Error) {
      this.logger.error({ ...context, err: error }, message);
    } else {
      this.logger.error(error ?? context ?? {}, message);
    }
  }

  public child(context: LogContext): ILogger {
    const childLogger = this.logger.child(context);
    return new PinoLoggerChild(childLogger);
  }
}

/**
 * Child logger wrapping Pino child logger
 */
class PinoLoggerChild implements ILogger {
  public constructor(private readonly logger: PinoLoggerType) {}

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  public error(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (error instanceof Error) {
      this.logger.error({ ...context, err: error }, message);
    } else {
      this.logger.error(error ?? context ?? {}, message);
    }
  }

  public child(context: LogContext): ILogger {
    const childLogger = this.logger.child(context);
    return new PinoLoggerChild(childLogger);
  }
}
