import { BaseError, type ErrorContext } from './BaseError.js';

export class DiagnosticError extends BaseError {
  public readonly source?: string;

  public constructor(
    message: string,
    context?: ErrorContext & { source?: string },
    originalError?: Error
  ) {
    super(message, context, originalError);
    this.source = context?.source;
    Object.setPrototypeOf(this, DiagnosticError.prototype);
  }
}
