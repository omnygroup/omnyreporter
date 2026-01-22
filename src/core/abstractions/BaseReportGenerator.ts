/**
 * Abstract base class for report generation
 * Implements Template Method pattern for diagnostic collection
 * @module core/abstractions/BaseReportGenerator
 */

import { DiagnosticError } from '../errors/index.js';
import { IntegrationName, ok, err, type Diagnostic, type Result } from '../types/index.js';

import type { ILogger, DiagnosticIntegration } from '../contracts/index.js';
import type { CollectionConfig } from '@domain';

export abstract class BaseReportGenerator implements DiagnosticIntegration {
  protected constructor(
    protected readonly logger: ILogger
  ) {}

  /**
   * Get name of the diagnostic source
   * Required by DiagnosticIntegration interface
   */
  public getName(): IntegrationName {
    return this.getIntegrationName();
  }

  /**
   * Collect diagnostics from source
   * Required by DiagnosticIntegration interface
   */
  public async collect(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    return this.execute(config);
  }

  public async execute(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    this.logStart(config);

    const result = await this.collectDiagnostics(config);

    this.logCompletion(result);

    return result;
  }

  protected abstract collectDiagnostics(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>>;

  protected abstract getIntegrationName(): IntegrationName;

  private logStart(config: CollectionConfig): void {
    const integration: string = this.getIntegrationName();
    this.logger.info(`Starting ${integration} diagnostic collection`, {
      source: integration,
      patterns: config.patterns.length,
    });
  }

  private logCompletion(result: Result<readonly Diagnostic[], DiagnosticError>): void {
    const integration: string = this.getIntegrationName();
    if (result.isOk()) {
      this.logger.info(`${integration} collection completed`, {
        source: integration,
        count: result.value.length,
      });
    } else {
      this.logger.error(`${integration} collection failed`, {
        source: integration,
        error: result.error.message,
      });
    }
  }

  protected createDiagnosticError(message: string, cause?: unknown): DiagnosticError {
    return new DiagnosticError(
      message,
      { source: this.getIntegrationName() },
      cause instanceof Error ? cause : undefined
    );
  }

  protected async runReporter<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<Result<T, DiagnosticError>> {
    try {
      const result = await operation();
      return ok(result);
    } catch (error) {
      return err(this.createDiagnosticError(errorMessage, error));
    }
  }
}
