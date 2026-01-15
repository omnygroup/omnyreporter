/**
 * Base diagnostic source abstract class
 * Provides template for all diagnostic collectors
 * @module core/abstractions/BaseDiagnosticSource
 */

import { ok, err ,type  Result } from '../types/result.js';

import type { CollectionConfig } from '../../domain/index.js';
import type { IDiagnosticSource } from '../contracts/index.js';
import type { Diagnostic } from '../types/index.js';


/**
 * Template method pattern for diagnostic source collection
 * Subclasses implement specific tool integration (ESLint, TypeScript, etc.)
 */
export abstract class BaseDiagnosticSource implements IDiagnosticSource {
  protected constructor(protected readonly name: string) {}

  /**
   * Template method - orchestrates diagnostic collection
   * @param config Collection configuration
   * @returns Result with diagnostics or error
   */
  public async collect(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], Error>> {
    try {
      const diagnostics = await this.doDiagnosticCollection(config);
      return ok(Object.freeze([...diagnostics]));
    } catch (error) {
      const errObj = error instanceof Error ? error : new Error(String(error));
      return err(errObj);
    }
  }

  /**
   * Abstract method for subclasses to implement specific collection logic
   * @param config Collection configuration
   * @returns Array of diagnostics
   */
  protected abstract doDiagnosticCollection(
    config: CollectionConfig
  ): Promise<readonly Diagnostic[]>;

  /**
   * Get source name
   * @returns Diagnostic source name
   */
  public getName(): string {
    return this.name;
  }
}
