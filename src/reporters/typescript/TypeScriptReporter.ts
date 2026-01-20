/**
 * TypeScript Reporter
 * Collects diagnostics from TypeScript compiler
 */

import ts from 'typescript';

import { BaseReportGenerator } from '@/application/usecases/BaseReportGenerator.js';
import { DiagnosticIntegration, DiagnosticError, type Diagnostic, type Result, type ILogger } from '@core';

import { TypeScriptDiagnosticResult } from './TypeScriptDiagnosticResult.js';

import type { CollectionConfig } from '@domain';

export class TypeScriptReporter extends BaseReportGenerator {
  public constructor(logger: ILogger) {
    super(logger);
  }

  protected getIntegrationName(): DiagnosticIntegration {
    return DiagnosticIntegration.TypeScript;
  }

  protected async collectDiagnostics(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    return this.runReporter(async () => {
      const configPath = config.configPath ?? 'tsconfig.json';
      const tsConfig = this.readConfig(configPath);
      const program = ts.createProgram(tsConfig.fileNames, tsConfig.options);
      const tsDiagnostics = ts.getPreEmitDiagnostics(program);

      return tsDiagnostics
        .filter((d): d is ts.Diagnostic & { file: ts.SourceFile; start: number } =>
          d.file !== undefined && d.start !== undefined
        )
        .map((d) => new TypeScriptDiagnosticResult(d).diagnostic);
    }, 'TypeScript compilation check failed');
  }

  private readConfig(configPath: string): ts.ParsedCommandLine {
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile.bind(ts.sys));

    if (configFile.error !== undefined) {
      throw this.createDiagnosticError('Failed to read tsconfig.json');
    }

    const configDir = configPath.replace(/[^\\/]+$/, '');
    return ts.parseJsonConfigFileContent(configFile.config, ts.sys, configDir === '' ? './' : configDir);
  }
}
