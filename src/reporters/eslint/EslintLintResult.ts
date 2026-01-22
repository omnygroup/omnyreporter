import { Diagnostic, IntegrationName } from '@core';

import type { ESLint } from 'eslint';


type EslintMessage = ESLint.LintResult['messages'][number];

/**
 * Value object representing a single ESLint lint result
 */
export class EslintLintResult {
  public readonly filePath: string;
  public readonly line: number;
  public readonly column: number;
  public readonly endLine: number | undefined;
  public readonly endColumn: number | undefined;
  public readonly severity: 'error' | 'warning';
  public readonly ruleId: string;
  public readonly message: string;

  public constructor(filePath: string, eslintMessage: EslintMessage) {
    this.filePath = filePath;
    this.line = eslintMessage.line;
    this.column = eslintMessage.column;
    this.endLine = eslintMessage.endLine;
    this.endColumn = eslintMessage.endColumn;
    this.severity = eslintMessage.severity === 2 ? 'error' : 'warning';
    this.ruleId = eslintMessage.ruleId ?? 'unknown';
    this.message = eslintMessage.message;
  }

  public get diagnostic(): Diagnostic {
    return new Diagnostic({
      source: IntegrationName.ESLint,
      filePath: this.filePath,
      line: this.line,
      column: this.column,
      endLine: this.endLine,
      endColumn: this.endColumn,
      severity: this.severity,
      code: this.ruleId,
      message: this.message,
    });
  }
}
