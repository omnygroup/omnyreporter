/**
 * Data sanitization using @pinojs/redact
 * @module infrastructure/security/RedactSanitizer
 */

import redactFn from '@pinojs/redact';
import { injectable, inject, optional } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import type { ISanitizer } from '@core';
import type { SanitizationConfig } from '@domain';

/** Default redact paths for sensitive data */
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

/** Default censor string */
const DEFAULT_CENSOR = '[REDACTED]';

/**
 * Sanitizer implementation using @pinojs/redact
 * Masks sensitive data in messages, paths, and objects
 */
@injectable()
export class RedactSanitizer implements ISanitizer {
	private readonly config: SanitizationConfig;
	private readonly redactor: ReturnType<typeof redactFn>;

	public constructor(
		@inject(TOKENS.PROJECT_CONFIG)
		@optional()
		config?: { sanitization?: SanitizationConfig }
	) {
		// Use provided config or defaults
		this.config = config?.sanitization ?? {
			enabled: true,
			paths: true,
			messages: true,
			objects: true,
			redactPaths: DEFAULT_REDACT_PATHS,
			censor: DEFAULT_CENSOR,
		};

		// Initialize redactor with configured paths
		// serialize: false returns the mutated object instead of JSON string
		this.redactor = redactFn({
			paths: this.config.redactPaths ?? DEFAULT_REDACT_PATHS,
			censor: this.config.censor ?? DEFAULT_CENSOR,
			serialize: false,
		});
	}

	/**
	 * Sanitize message string by removing sensitive patterns
	 * @param message Message to sanitize
	 * @returns Sanitized message
	 */
	public sanitizeMessage(message: string): string {
		if (!this.config.enabled || !this.config.messages) {
			return message;
		}

		const censor = this.config.censor ?? DEFAULT_CENSOR;

		return message
			// Base64-like tokens (20+ chars)
			.replace(/([A-Za-z0-9+/=]{20,})/g, censor)
			// Bearer tokens
			.replace(/Bearer\s+\S+/gi, `Bearer ${censor}`)
			// Password patterns
			.replace(/password\s*[:=]\s*\S+/gi, `password=${censor}`)
			// API key patterns
			.replace(/api[_-]?key\s*[:=]\s*\S+/gi, `apiKey=${censor}`)
			// Secret patterns
			.replace(/secret\s*[:=]\s*\S+/gi, `secret=${censor}`)
			// Authorization header values
			.replace(/authorization\s*[:=]\s*\S+/gi, `authorization=${censor}`);
	}

	/**
	 * Sanitize file path by removing user directories
	 * @param path Path to sanitize
	 * @returns Sanitized path
	 */
	public sanitizePath(path: string): string {
		if (!this.config.enabled || !this.config.paths) {
			return path;
		}

		return path
			// macOS/Linux: /Users/username or /home/username
			.replace(/\/Users\/[^/]+/g, '/~')
			.replace(/\/home\/[^/]+/g, '/~')
			// Windows: C:\Users\username
			.replace(/C:\\Users\\[^\\]+/g, 'C:\\~')
			.replace(/D:\\Users\\[^\\]+/g, 'D:\\~');
	}

	/**
	 * Sanitize object by redacting sensitive fields
	 * Uses @pinojs/redact for deep object traversal
	 * @param obj Object to sanitize
	 * @returns Sanitized object copy
	 */
	public sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
		if (!this.config.enabled || !this.config.objects) {
			return obj;
		}

		// Create a deep copy to avoid mutating original
		const copy = JSON.parse(JSON.stringify(obj)) as T;

		// Apply redactor (with serialize: false, it returns the mutated object)
		const redacted = this.redactor(copy) as T;

		// Also sanitize any string values that look like paths
		this.sanitizePathsInObject(redacted as Record<string, unknown>);

		return redacted;
	}

	/**
	 * Recursively sanitize path-like strings in object
	 */
	private sanitizePathsInObject(obj: Record<string, unknown>): void {
		for (const key of Object.keys(obj)) {
			const value = obj[key];

			if (typeof value === 'string' && this.looksLikePath(value)) {
				obj[key] = this.sanitizePath(value);
			} else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				this.sanitizePathsInObject(value as Record<string, unknown>);
			} else if (Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					const item = value[i];
					if (typeof item === 'string' && this.looksLikePath(item)) {
						value[i] = this.sanitizePath(item);
					} else if (typeof item === 'object' && item !== null) {
						this.sanitizePathsInObject(item as Record<string, unknown>);
					}
				}
			}
		}
	}

	/**
	 * Check if string looks like a file path
	 */
	private looksLikePath(value: string): boolean {
		return (
			value.startsWith('/Users/') ||
			value.startsWith('/home/') ||
			/^[A-Z]:\\Users\\/i.test(value)
		);
	}
}
