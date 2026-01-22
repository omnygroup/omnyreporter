/**
 * File system-related errors
 * @module core/errors/FileSystemError
 */

import { BaseError, type ErrorContext } from './BaseError.js';

/**
 * Thrown when file system operation fails
 */
export class FileSystemError extends BaseError {
	public constructor(message: string, context?: ErrorContext, originalError?: Error) {
		super(message, context, originalError);
		Object.setPrototypeOf(this, FileSystemError.prototype);
	}
}
