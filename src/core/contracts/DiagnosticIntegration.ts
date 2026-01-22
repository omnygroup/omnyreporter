/**
 * Diagnostic integration contract
 * @module core/contracts/DiagnosticIntegration
 */

import type { CollectionConfig } from '../../domain/index.js';
import type { DiagnosticError } from '../errors/index.js';
import type { Diagnostic, Result } from '../types/index.js';

export interface DiagnosticIntegration {
  /**
   * Collect diagnostics from source
   * @param config Collection configuration
   * @returns Result with diagnostics or error
   */
  collect(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>>;

  /**
   * Get name of the diagnostic source
   * @returns Source name
   */
  getName(): string;
}
