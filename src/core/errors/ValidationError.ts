/**
 * Validation-related errors
 * @module core/errors/ValidationError
 */

import { BaseError, type ErrorContext } from './BaseError.js';

/**
 * Thrown when validation of data fails
 */
export class ValidationError extends BaseError {
	public readonly issues?: readonly unknown[];

	public constructor(
		message: string,
		context?: ErrorContext & { issues?: readonly unknown[] },
		originalError?: Error
	) {
		super(message, context, originalError);
		this.issues = context?.issues;
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}
