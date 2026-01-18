/**
 * Configuration validator using zod
 * @module domain/validation/ConfigValidator
 */

// Inversify decorator - import needed for @injectable decorator to work at runtime
import { injectable } from 'inversify';
import { z } from 'zod';

import { ValidationError, ok, err, type Result } from '../../core/index.js';

import { CollectionConfigSchema, type CollectionConfig } from './schemas/index.js';

/**
 * Facade for configuration validation
 */
@injectable()
export class ConfigValidator {
  /**
   * Validate collection configuration
   * @param data Data to validate
   * @returns Validation result
   */
  public validate(data: unknown): Result<CollectionConfig, ValidationError> {
    return ConfigValidator.validateStatic<CollectionConfig>(data, CollectionConfigSchema);
  }

  /**
   * Validate configuration and throw on error
   * @param data Data to validate
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  public validateOrThrow(data: unknown): CollectionConfig {
    return ConfigValidator.validateOrThrowStatic<CollectionConfig>(data, CollectionConfigSchema);
  }

  /**
   * Static validation method for any schema
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validation result
   */
  public static validateStatic<T>(data: unknown, schema: z.ZodType<T>): Result<T, ValidationError> {
    const parseResult = schema.safeParse(data);

    if (parseResult.success) {
      return ok(parseResult.data);
    }

    return err(
      new ValidationError('Configuration validation failed', {
        issues: parseResult.error.issues,
      })
    );
  }

  /**
   * Static validation method that throws on error
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  public static validateOrThrowStatic<T>(data: unknown, schema: z.ZodType<T>): T {
    const result = ConfigValidator.validateStatic<T>(data, schema);

    if (!result.isOk()) {
      throw result.error;
    }

    return result.value;
  }
}

