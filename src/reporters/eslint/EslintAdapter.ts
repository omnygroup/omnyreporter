/**
 * ESLint adapter - wrapper around ESLint API
 * @module reporters/eslint/EslintAdapter
 */

import { ESLint } from 'eslint';

import { DiagnosticError ,type  Diagnostic,type  ILogger } from '../../core/index.js';
import { DiagnosticMapper ,type  RawDiagnosticData } from '../../domain/index.js';

/**
 * Adapter for ESLint API
 */
export class EslintAdapter {
  private eslint: ESLint | null = null;

  public constructor(private readonly logger: ILogger) {}

  /**
   * Run ESLint on patterns
   * @param patterns Glob patterns for files
   * @param configPath Optional path to eslint config
   * @returns Array of diagnostics
   */
  public async lint(patterns: readonly string[], configPath?: string): Promise<readonly Diagnostic[]> {
    try {
      this.logger.info('Starting ESLint', { patterns: patterns.length });

      const eslint = new ESLint({
        overrideConfigFile: configPath ?? undefined,
      });

      let results = [] as any[];
      try {
        results = await eslint.lintFiles([...patterns]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/no files|no matching|nothing matched|matched no files/i.test(msg)) {
          this.logger.info('ESLint: no files matched patterns', { patterns });
          return [];
        }
        throw e;
      }
      const diagnostics: RawDiagnosticData[] = [];

      results.forEach((result) => {
        result.messages.forEach((message: any) => {
          diagnostics.push({
            filePath: result.filePath,
            line: message.line,
            column: message.column,
            endLine: message.endLine,
            endColumn: message.endColumn,
            severity: message.severity === 2 ? 'error' : 'warning',
            code: message.ruleId ?? 'unknown',
            message: message.message,
            source: 'eslint',
          });
        });
      });

      const mapper = new DiagnosticMapper();
      const mapped = mapper.mapArray(diagnostics);

      this.logger.info('ESLint completed', { issuesFound: mapped.length });

      return mapped;
    } catch (error) {
      throw new DiagnosticError(
        'ESLint linting failed',
        { source: 'eslint' },
        error instanceof Error ? error : undefined
      );
    } finally {
      if (this.eslint) {
        await this.eslint.lintFiles([]);
      }
    }
  }
}
