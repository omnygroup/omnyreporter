/**
 * Base Report Generator
 * Abstract base class for all diagnostic report generators
 * @module application/usecases/BaseReportGenerator
 */

import type { Diagnostic, DiagnosticError, Result, ILogger } from '@core';
import type { CollectionConfig } from '@domain';

/**
 * Abstract base class for report generation
 * Implements Template Method pattern for diagnostic collection
 * 
 * Subclasses (reporters) must implement:
 * - collectDiagnostics(): Tool-specific collection logic
 * - getSourceName(): Tool identifier
 */
export abstract class BaseReportGenerator {
  protected constructor(
    protected readonly logger: ILogger
  ) {}

  /**
   * Execute report generation workflow
   * Template method defining the algorithm structure
   * @param config Collection configuration
   * @returns Result with collected diagnostics
   */
  public async execute(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    this.logStart(config);
    
    const result = await this.collectDiagnostics(config);
    
    this.logCompletion(result);
    
    return result;
  }

  /**
   * Collect diagnostics from specific tool
   * Must be implemented by subclasses
   * @param config Collection configuration
   * @returns Result with diagnostics
   */
  protected abstract collectDiagnostics(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>>;

  /**
   * Get source name identifier
   * Must be implemented by subclasses
   * @returns Source name (e.g., 'eslint', 'typescript')
   */
  protected abstract getSourceName(): string;

  /**
   * Log collection start
   * @param config Collection configuration
   */
  private logStart(config: CollectionConfig): void {
    this.logger.info(`Starting ${this.getSourceName()} diagnostic collection`, {
      source: this.getSourceName(),
      patterns: config.patterns.length,
    });
  }

  /**
   * Log collection completion
   * @param result Collection result
   */
  private logCompletion(result: Result<readonly Diagnostic[], DiagnosticError>): void {
    if (result.isOk()) {
      this.logger.info(`${this.getSourceName()} collection completed`, {
        source: this.getSourceName(),
        count: result.value.length,
      });
    } else {
      this.logger.error(`${this.getSourceName()} collection failed`, {
        source: this.getSourceName(),
        error: result.error.message,
      });
    }
  }
}
