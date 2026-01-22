/**
 * OmnyReporter Configuration
 * @see https://github.com/omnygroup/omnyreporter
 */

import type { OmnyReporterConfig } from './src/domain/validation/schemas/omnyReporterConfig.schema.js';

const config: OmnyReporterConfig = {
	/**
	 * Sanitization settings
	 * Controls how sensitive data is redacted in logs and reports
	 */
	sanitization: {
		/** Enable/disable sanitization globally */
		enabled: true,

		/** Sanitize file paths (remove /Users/username, /home/username, etc.) */
		paths: true,

		/** Sanitize log messages (remove tokens, passwords, API keys) */
		messages: true,

		/** Sanitize objects using @pinojs/redact */
		objects: true,

		/** Paths for @pinojs/redact to redact in objects (supports wildcards) */
		redactPaths: [
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
		],

		/** Replacement string for redacted values */
		censor: '[REDACTED]',
	},

	/**
	 * Collection settings
	 * Controls how diagnostics are collected from tools
	 */
	collection: {
		/** Glob patterns for files to lint */
		patterns: ['src/**/*.ts'],

		/** Patterns to ignore */
		ignorePatterns: ['node_modules/**', 'dist/**', '**/*.test.ts'],

		/** Number of concurrent operations */
		concurrency: 4,

		/** Timeout in milliseconds */
		timeout: 30000,

		/** Enable caching of results */
		cache: false,

		/** Enable ESLint checking */
		eslint: true,

		/** Enable TypeScript checking */
		typescript: true,
	},

	/**
	 * Reporting settings
	 * Controls how reports are generated and stored
	 */
	reporting: {
		/** Output directory for generated reports */
		outputDir: '.omnyreporter',

		/** Output formats for reports */
		formats: ['console', 'json'],

		/** Include source code snippets in reports */
		includeSource: true,

		/** Timestamp format (iso, unix, locale) */
		timestampFormat: 'iso',
	},

	/** Enable verbose logging output */
	verbose: false,

	/** Suppress non-error output */
	quiet: false,
};

export default config;
