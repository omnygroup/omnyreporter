/**
 * Enhanced IDiagnosticSource with examples and error documentation
 * @module core/contracts/IDiagnosticSource
 */

import type { Diagnostic, Result } from '../types/index.js';
import type { CollectionConfig } from '../../domain/index.js';

export interface IDiagnosticSource {
  /**
   * Collect diagnostics from source
   * @param config Collection configuration with patterns and ignore rules
   * @returns Result with diagnostics array or error
   * @throws Error Wrapped in Err result if collection fails
   * @example
   * ```typescript
   * const eslint = new EslintAdapter(logger);
   * const result = await eslint.collect({ patterns: ['src/**\/*.ts'] });
   * if (result.isOk()) {
   *   const diagnostics = result.value;
   *   console.log(`Found ${diagnostics.length} issues`);
   * } else {
   *   const error = result.error;
   *   console.error('Collection failed:', error.message);
   * }
   * ```
   */
  collect(config: CollectionConfig): Promise<Result<readonly Diagnostic[], Error>>;

  /**
   * Get name of the diagnostic source
   * @returns Source name (e.g., 'eslint', 'typescript', 'vitest')
   * @example
   * ```typescript
   * const name = eslint.getName(); // 'eslint'
   * console.log(`Using ${name} adapter`);
   * ```
   */
  getName(): string;
}
