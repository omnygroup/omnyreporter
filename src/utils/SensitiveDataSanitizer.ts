import slowRedact from '@pinojs/redact';

/**
 * Sanitizer for removing sensitive data from test results
 * Uses @pinojs/redact for immutable redaction of sensitive paths
 */
export class SensitiveDataSanitizer {
	private readonly redact: (obj: Record<string, unknown>) => string | Record<string, unknown>;

	public constructor() {
		this.redact = slowRedact({
			paths: [
				'password',
				'passwd',
				'pwd',
				'secret',
				'token',
				'apiKey',
				'api_key',
				'accessToken',
				'access_token',
				'refreshToken',
				'refresh_token',
				'authorization',
				'auth',
				'bearer',
				'credentials',
				'headers.cookie',
				'headers.authorization',
				'headers.x-api-key',
				'headers.x-auth-token',
				'headers.x-access-token',
				'env.DB_PASSWORD',
				'env.API_KEY',
				'env.SECRET_KEY',
				'env.AUTH_TOKEN',
				'process.env.PASSWORD',
				'process.env.API_KEY',
				'process.env.SECRET',
				'process.env.TOKEN',
			],
			censor: '[REDACTED]',
			serialize: true,
		});
	}

	/**
	 * Sanitize an object by removing sensitive data
	 * @param obj Object to sanitize
	 * @returns JSON string with sensitive data redacted
	 */
	public sanitize(obj: Record<string, unknown>): string {
		const result = this.redact(obj);
		return typeof result === 'string' ? result : JSON.stringify(result);
	}

	/**
	 * Parse and return the sanitized object
	 * @param obj Object to sanitize
	 * @returns Parsed object with sensitive data redacted
	 */
	public sanitizeToObject(obj: Record<string, unknown>): Record<string, unknown> {
		return JSON.parse(this.sanitize(obj)) as Record<string, unknown>;
	}
}

export const sanitizer = new SensitiveDataSanitizer();
