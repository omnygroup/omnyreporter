import { BaseError, type ErrorContext } from './BaseError.js';

export class DiagnosticError extends BaseError {
	public readonly integration?: string;

	public constructor(message: string, context?: ErrorContext & { integration?: string }, originalError?: Error) {
		super(message, context, originalError);
		this.integration = context?.integration;
		Object.setPrototypeOf(this, DiagnosticError.prototype);
	}
}
