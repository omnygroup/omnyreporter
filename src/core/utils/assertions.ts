/**
 * Runtime assertions
 * @module core/utils/assertions
 */

/**
 * Assert that value is not nullish
 * @param value Value to assert
 * @param message Error message
 * @throws If value is null or undefined
 */
export function assertNotNullish<T>(
  value: T | null | undefined,
  message = 'Value must not be null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Assert that condition is true
 * @param condition Condition to check
 * @param message Error message
 * @throws If condition is false
 */
export function assertTrue(
  condition: unknown,
  message = 'Assertion failed: condition must be true'
): asserts condition {
  // Use explicit comparison to satisfy strict-boolean-expressions without extra boolean cast
  if (condition !== true) {
    throw new Error(message);
  }
}

/**
 * Assert that value matches type
 * @param value Value to check
 * @param type Type name
 * @param message Error message
 * @throws If type doesn't match
 */
export function assertType(
  value: unknown,
  type: string,
  message?: string
): void {
  if (typeof value !== type) {
    throw new Error(message ?? `Expected type ${type}, got ${typeof value}`);
  }
}
