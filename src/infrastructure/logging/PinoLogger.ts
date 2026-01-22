/**
 * Pino-based logger implementation
 * Single consolidated logger for the entire application
 * @module infrastructure/logging/PinoLogger
 */

import { injectable, inject, optional } from 'inversify';
import pino, { type Logger as PinoLoggerType } from 'pino';

import { TOKENS } from '@/di/tokens.js';
import type { ILogger, LogContext } from '@core';
import type { SanitizationConfig } from '@domain';

/** Default redact paths for pino */
const DEFAULT_REDACT_PATHS = [
	'password',
	'token',
	'secret',
	'apiKey',
	'authorization',
	'credentials',
	'*.password',
	'*.token',
	'*.secret',
	'*.apiKey',
];

/**
 * Logger implementation using Pino
 * Provides structured logging with context support
 * Uses pino's built-in redact for sanitization
 */
@injectable()
export class PinoLogger implements ILogger {
	private readonly logger: PinoLoggerType;

	public constructor(
		@inject(TOKENS.PROJECT_CONFIG)
		@optional()
		config?: { sanitization?: SanitizationConfig }
	) {
		const sanitizationConfig = config?.sanitization;
		const redactEnabled = sanitizationConfig?.enabled !== false && sanitizationConfig?.objects !== false;

		this.logger = pino({
			name: 'omnyreporter',
			level: 'info',
			// Use pino's built-in redact feature
			redact: redactEnabled
				? {
						paths: sanitizationConfig?.redactPaths ?? DEFAULT_REDACT_PATHS,
						censor: sanitizationConfig?.censor ?? '[REDACTED]',
					}
				: undefined,
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
		const logger = this.logger;
		logger.debug(context ?? {}, message);
	}

	public info(message: string, context?: LogContext): void {
		const logger = this.logger;
		logger.info(context ?? {}, message);
	}

	public warn(message: string, context?: LogContext): void {
		const logger = this.logger;
		logger.warn(context ?? {}, message);
	}

	public error(message: string, error?: Error | LogContext, context?: LogContext): void {
		const logger = this.logger;
		if (error instanceof Error) {
			logger.error({ ...context, err: error }, message);
		} else {
			logger.error(error ?? context ?? {}, message);
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
