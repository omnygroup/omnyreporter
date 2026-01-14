/**
 * Configuration validator using zod
 * @module domain/validation/ConfigValidator
 */

// Inversify decorator - import needed for @injectable decorator to work at runtime
import { injectable } from 'inversify';
import type { ZodSchema } from 'zod';

import { ValidationError, ok, err } from '../../core/index.js';
import type { Result } from '../../core/index.js';
import { CollectionConfigSchema } from './schemas/index.js';
import type { CollectionConfig } from './schemas/index.js';

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
  public static validateStatic<T>(data: unknown, schema: ZodSchema): Result<T, ValidationError> {
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
   * Static validation method that throws on error
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  public static validateOrThrowStatic<T>(data: unknown, schema: ZodSchema): T {
    const result = ConfigValidator.validateStatic<T>(data, schema);

    if (!result.isOk()) {
      throw result.error;
    }

    return result.value;
  }

  /**
   * Validate configuration against schema (deprecated, use validateStatic instead)
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validation result
   * @deprecated Use validateStatic instead
   */
  public static validate<T>(data: unknown, schema: ZodSchema): Result<T, ValidationError> {
    return ConfigValidator.validateStatic<T>(data, schema);
  }

  /**
   * Validate configuration and throw on error (deprecated, use validateOrThrowStatic instead)
   * @param data Data to validate
   * @param schema Zod schema to validate against
   * @returns Validated data
   * @throws ValidationError if validation fails
   * @deprecated Use validateOrThrowStatic instead
   */
  public static validateOrThrow<T>(data: unknown, schema: ZodSchema): T {
    return ConfigValidator.validateOrThrowStatic<T>(data, schema);
  }
}

