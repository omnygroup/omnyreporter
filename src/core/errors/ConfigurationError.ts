/**
 * Configuration-related errors
 * @module core/errors/ConfigurationError
 */

import { BaseError, type ErrorContext } from './BaseError.js';

/**
 * Thrown when configuration is invalid or missing required fields
 */
export class ConfigurationError extends BaseError {
	public constructor(message: string, context?: ErrorContext, originalError?: Error) {
		super(message, context, originalError);
		Object.setPrototypeOf(this, ConfigurationError.prototype);
	}
}
