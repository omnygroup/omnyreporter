import { DiagnosticError, ok, err, type Diagnostic, type Result, type ILogger, DiagnosticIntegration } from '@core';

import type { CollectionConfig } from '@domain';

/**
 * Abstract base class for report generation
 * Implements Template Method pattern for diagnostic collection
 */
export abstract class BaseReportGenerator {
  protected constructor(
    protected readonly logger: ILogger
  ) {}

  public async execute(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    this.logStart(config);

    const result = await this.collectDiagnostics(config);

    this.logCompletion(result);

    return result;
  }

  protected abstract collectDiagnostics(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>>;

  protected abstract getIntegrationName(): DiagnosticIntegration;

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
