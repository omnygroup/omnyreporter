import pino from 'pino';

/**
 * Logger instance for @omnygroup/omnyreporter
 * Provides info, error, warn, and debug logging methods
 */
export const logger = pino({
	level: 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			ignore: 'pid,hostname',
			singleLine: false,
		},
	},
});

export type Logger = typeof logger;
