/**
 * ESLint adapter - wrapper around ESLint API
 * @module reporters/eslint/EslintAdapter
 */

import { ESLint } from 'eslint';

import { DiagnosticError, type Diagnostic, type ILogger } from '../../core/index.js';
import { DiagnosticMapper, type RawDiagnosticData } from '../../domain/index.js';

/**
 * Adapter for ESLint API
 */
export class EslintAdapter {
  private eslint: ESLint | null = null;

  public constructor(
    private readonly logger: ILogger,
    private readonly verbose: boolean = false
  ) {}

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
        cwd: process.cwd(),
        // Ensure plugins and configs resolve relative to project root
      });
      // keep instance for potential cleanup
      this.eslint = eslint;

      let results: ESLint.LintResult[] = [];
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
      const diagnostics: RawDiagnosticData[] = this.buildDiagnostics(results);

      const mapper = new DiagnosticMapper();
      const mapped = mapper.mapArray(diagnostics);

      this.logger.info('ESLint completed', { issuesFound: mapped.length });

      return mapped;
    } catch (error) {
        // Propagate ESLint errors so the CLI can report failures (parsing/config issues)
        throw new DiagnosticError(
          'ESLint linting failed',
          { source: 'eslint' },
          error instanceof Error ? error : undefined
        );
    } finally {
        if (this.eslint !== null) {
          try {
            await this.eslint.lintFiles([]);
          } catch {
            // ignore cleanup errors
          }
        }
      }
  }

  private buildDiagnostics(results: ESLint.LintResult[]): RawDiagnosticData[] {
    const diagnostics: RawDiagnosticData[] = [];

    for (const result of results) {
      for (const message of result.messages) {
        const msg = message as unknown as {
          line?: number;
          column?: number;
          endLine?: number;
          endColumn?: number;
          severity?: number;
          ruleId?: string | null;
          message: string;
        };

        const line = msg.line ?? 0;
        const column = msg.column ?? 0;
        const endLine = msg.endLine ?? undefined;
        const endColumn = msg.endColumn ?? undefined;

        diagnostics.push({
          filePath: result.filePath,
          line,
          column,
          endLine,
          endColumn,
          severity: msg.severity === 2 ? 'error' : 'warning',
          code: msg.ruleId ?? 'unknown',
          message: msg.message,
          source: 'eslint',
        });
      }
    }

    return diagnostics;
  }
}
