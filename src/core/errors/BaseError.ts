/**
 * Base error class with context
 * @module core/errors/BaseError
 */

export type ErrorContext = Readonly<Record<string, unknown>>;

/**
 * Base error class extending Error with context support
 * All custom errors should extend this class
 */
export abstract class BaseError extends Error {
  public readonly context: Readonly<ErrorContext>;
  public readonly timestamp: Date;

  public constructor(
    message: string,
    context?: ErrorContext,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.context = Object.freeze(context ?? {});
    this.timestamp = new Date();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  /**
   * Check if error is of specific type
   * @param type Error class to check
   * @returns True if error is of specified type
   */
  public isInstanceOf<T extends BaseError>(type: new (...args: unknown[]) => T): boolean {
    return this instanceof type;
  }

  /**
   * Convert error to plain object for serialization
   * @returns Serializable error object
   */
  public toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
      } : undefined,
    };
  }
}
