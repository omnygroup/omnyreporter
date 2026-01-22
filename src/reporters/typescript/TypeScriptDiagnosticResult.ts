import ts from 'typescript';

import { Diagnostic, IntegrationName } from '@core';

type TsDiagnosticWithLocation = ts.Diagnostic & { file: ts.SourceFile; start: number };

/**
 * Value object representing a single TypeScript diagnostic result
 */
export class TypeScriptDiagnosticResult {
  public readonly filePath: string;
  public readonly line: number;
  public readonly column: number;
  public readonly severity: 'error' | 'warning';
  public readonly code: string;
  public readonly message: string;

  public constructor(diagnostic: TsDiagnosticWithLocation) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

    this.filePath = diagnostic.file.fileName;
    this.line = line + 1;
    this.column = character + 1;
    this.severity = diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning';
    this.code = String(diagnostic.code);
    this.message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  }

  public get diagnostic(): Diagnostic {
    return new Diagnostic({
      source: IntegrationName.TypeScript,
      filePath: this.filePath,
      line: this.line,
      column: this.column,
      severity: this.severity,
      code: this.code,
      message: this.message,
    });
  }
}
