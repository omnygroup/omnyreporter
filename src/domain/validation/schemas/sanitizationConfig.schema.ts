/**
 * Sanitization config validation schema
 * @module domain/validation/schemas/sanitizationConfig.schema
 */

import { z } from 'zod';

/**
 * Schema for sanitization configuration
 * Controls how sensitive data is redacted in logs and reports
 */
export const SanitizationConfigSchema = z.object({
	/** Enable/disable sanitization globally */
	enabled: z
		.boolean()
		.default(true)
		.describe('Enable sanitization of sensitive data'),

	/** Sanitize file paths (remove /Users/username, etc.) */
	paths: z
		.boolean()
		.default(true)
		.describe('Sanitize file paths to hide user directories'),

	/** Sanitize log messages (remove tokens, passwords) */
	messages: z
		.boolean()
		.default(true)
		.describe('Sanitize messages to remove sensitive patterns'),

	/** Sanitize objects using @pinojs/redact */
	objects: z
		.boolean()
		.default(true)
		.describe('Sanitize objects using redact library'),

	/** Paths for @pinojs/redact to redact in objects */
	redactPaths: z
		.array(z.string())
		.default([
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
		])
		.describe('Object paths to redact (supports wildcards)'),

	/** Replacement string for redacted values */
	censor: z
		.string()
		.default('[REDACTED]')
		.describe('String to replace redacted values with'),
});

export type SanitizationConfig = z.infer<typeof SanitizationConfigSchema>;
