/**
 * ESLint Reporter
 * Collects diagnostics from ESLint
 * @module reporters/eslint/EslintReporter
 */

import { ESLint } from 'eslint';

import { BaseReportGenerator } from '@/application/usecases/BaseReportGenerator.js';
import { DiagnosticError, ok, err, type Diagnostic, type Result, type ILogger } from '@core';
import { type CollectionConfig, DiagnosticMapper, type RawDiagnosticData } from '@domain';

export class EslintReporter extends BaseReportGenerator {
  private readonly mapper: DiagnosticMapper;

  public constructor(logger: ILogger) {
    super(logger);
    this.mapper = new DiagnosticMapper();
  }

  /**
   * Get source name
   * @returns Source identifier
   */
  protected getSourceName(): string {
    return 'eslint';
  }

  /**
   * Collect ESLint diagnostics
   * @param config Collection configuration
   * @returns Result with diagnostics
   */
  protected async collectDiagnostics(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    try {
      const eslint = this.createEslintInstance(config);
      const lintResults = await this.runLinting(eslint, config.patterns);
      
      if (lintResults.length === 0) {
        return ok([]);
      }

      const rawDiagnostics = this.convertResultsToDiagnostics(lintResults);
      const diagnostics = this.mapper.mapArray(rawDiagnostics);

      return ok(diagnostics);
    } catch (error) {
      return err(
        new DiagnosticError(
          'ESLint linting failed',
          { source: 'eslint' },
          error instanceof Error ? error : undefined
        )
      );
    }
  }

  /**
   * Create ESLint instance
   * @param config Collection configuration
   * @returns ESLint instance
   */
  private createEslintInstance(config: CollectionConfig): ESLint {
    return new ESLint({
      overrideConfigFile: config.configPath ?? undefined,
      cwd: process.cwd(),
    });
  }

  /**
   * Run linting
   * @param eslint ESLint instance
   * @param patterns File patterns
   * @returns Lint results
   */
  private async runLinting(eslint: ESLint, patterns: readonly string[]): Promise<ESLint.LintResult[]> {
    try {
      return await eslint.lintFiles([...patterns]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      if (this.isNoFilesMatchedError(message)) {
        this.logger.info('ESLint: no files matched patterns', { patterns });
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Check if error is "no files matched"
   * @param message Error message
   * @returns True if no files matched
   */
  private isNoFilesMatchedError(message: string): boolean {
    return /no files|no matching|nothing matched|matched no files/i.test(message);
  }

  /**
   * Convert ESLint results to raw diagnostics
   * @param results ESLint lint results
   * @returns Raw diagnostic data array
   */
  private convertResultsToDiagnostics(results: ESLint.LintResult[]): RawDiagnosticData[] {
    const diagnostics: RawDiagnosticData[] = [];

    for (const result of results) {
      for (const message of result.messages) {
        const diagnostic = this.convertMessageToDiagnostic(result.filePath, message);
        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }

  /**
   * Convert single ESLint message to diagnostic
   * @param filePath File path
   * @param message ESLint message
   * @returns Raw diagnostic data
   */
  private convertMessageToDiagnostic(
    filePath: string,
    message: ESLint.LintResult['messages'][number]
  ): RawDiagnosticData {
    return {
      filePath,
      line: message.line ?? 0,
      column: message.column ?? 0,
      endLine: message.endLine ?? undefined,
      endColumn: message.endColumn ?? undefined,
      severity: this.mapSeverity(message.severity),
      code: message.ruleId ?? 'unknown',
      message: message.message,
      source: 'eslint',
    };
  }

  /**
   * Map ESLint severity to diagnostic severity
   * @param severity ESLint severity (1=warning, 2=error)
   * @returns Diagnostic severity
   */
  private mapSeverity(severity: number): 'error' | 'warning' {
    return severity === 2 ? 'error' : 'warning';
  }
}
