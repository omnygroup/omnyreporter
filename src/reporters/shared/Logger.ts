/**
 * Logger implementation using pino
 */

import pino from 'pino';

import type { Logger } from '../interfaces.js';

export class LoggerImpl implements Logger {
	readonly #logger: pino.Logger;

	public constructor(options: pino.LoggerOptions = {}) {
		this.#logger = pino({
			level: process.env['LOG_LEVEL'] ?? 'info',
			transport: process.env['NODE_ENV'] !== 'production'
				? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'HH:MM:ss',
						ignore: 'pid,hostname',
					},
				}
				: undefined,
			...options,
		});
	}

	public info(message: string, ...args: unknown[]): void {
		this.#logger.info(args.length > 0 ? { args } : {}, message);
	}

	public warn(message: string, ...args: unknown[]): void {
		this.#logger.warn(args.length > 0 ? { args } : {}, message);
	}

	public error(message: string, ...args: unknown[]): void {
		this.#logger.error(args.length > 0 ? { args } : {}, message);
	}

	public debug(message: string, ...args: unknown[]): void {
		this.#logger.debug(args.length > 0 ? { args } : {}, message);
	}

	/**
	 * Get the underlying pino logger instance
	 */
	public getLogger(): pino.Logger {
		return this.#logger;
	}
}
