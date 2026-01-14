/**
 * Configuration validator using zod
 * @module domain/validation/ConfigValidator
 */

// Inversify decorator - import needed for @injectable decorator to work at runtime
import { injectable } from 'inversify';
import type { ZodSchema } from 'zod';

import { ValidationError, ok, err } from '../../core/index.js';
import type { Result } from '../../core/index.js';

/**
 * Facade for configuration validation
 */
@injectable()
export class ConfigValidator {
  /**
   * Validate configuration against schema
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validation result
   */
  public static validate<T>(data: unknown, schema: ZodSchema): Result<T, ValidationError> {
    const parseResult = schema.safeParse(data);

    if (parseResult.success) {
      return ok(parseResult.data as T);
    }

    return err(
      new ValidationError('Configuration validation failed', {
        issues: parseResult.error.issues,
      })
    );
  }

  /**
   * Validate configuration and throw on error
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  public static validateOrThrow<T>(data: unknown, schema: ZodSchema): T {
    const result = this.validate<T>(data, schema);

    if (!result.isOk()) {
      throw result.error;
    }

    return result.value;
  }
}
