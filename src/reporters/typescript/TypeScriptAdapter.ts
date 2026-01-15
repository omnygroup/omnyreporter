/**
 * TypeScript adapter - wrapper around TypeScript Compiler API
 * @module reporters/typescript/TypeScriptAdapter
 */

import ts from 'typescript';

import { DiagnosticError ,type  Diagnostic,type  ILogger } from '../../core/index.js';
import { DiagnosticMapper ,type  RawDiagnosticData } from '../../domain/index.js';

/**
 * Adapter for TypeScript Compiler API
 */
export class TypeScriptAdapter {
  public constructor(private readonly logger: ILogger) {}

  /**
   * Check TypeScript files
   * @param configPath Path to tsconfig.json
   * @returns Array of diagnostics
   */
  public async check(configPath: string): Promise<readonly Diagnostic[]> {
    try {
      this.logger.info('Starting TypeScript diagnostics', { configPath });

      const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

      if (configFile.error) {
        throw new DiagnosticError(
          'Failed to read tsconfig.json',
          { source: 'typescript', configPath },
          undefined
        );
      }

      const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        configPath.replace(/[^\\/]+$/, '') || './',
      );

      const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
      const diagnostics = ts.getPreEmitDiagnostics(program);

      const mapped: RawDiagnosticData[] = [];

      diagnostics.forEach((diagnostic) => {
        if (!diagnostic.file) return;

        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);

        mapped.push({
          filePath: diagnostic.file.fileName,
          line: line + 1,
          column: character + 1,
          severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
          code: String(diagnostic.code),
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          source: 'typescript',
        });
      });

      this.logger.info('TypeScript diagnostics completed', { issuesFound: mapped.length });

      return new DiagnosticMapper().mapArray(mapped);
    } catch (error) {
      if (error instanceof DiagnosticError) {
        throw error;
      }
      throw new DiagnosticError(
        'TypeScript compilation check failed',
        { source: 'typescript' },
        error instanceof Error ? error : undefined
      );
    }
  }
}
