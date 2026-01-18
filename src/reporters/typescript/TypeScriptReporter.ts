/**
 * TypeScript Reporter
 * Collects diagnostics from TypeScript compiler
 * @module reporters/typescript/TypeScriptReporter
 */

import ts from 'typescript';

import { BaseReportGenerator } from '@/application/usecases/BaseReportGenerator.js';
import { DiagnosticError, ok, err, type Diagnostic, type Result, type ILogger } from '@core';
import { type CollectionConfig, DiagnosticMapper, type RawDiagnosticData } from '@domain';

/**
 * TypeScript diagnostic reporter
 * Extends BaseReportGenerator with TypeScript-specific logic
 */
export class TypeScriptReporter extends BaseReportGenerator {
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
    return 'typescript';
  }

  /**
   * Collect TypeScript diagnostics
   * @param config Collection configuration
   * @returns Result with diagnostics
   */
  protected async collectDiagnostics(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    try {
      const configPath = this.resolveConfigPath(config);
      const tsConfig = this.readTypeScriptConfig(configPath);
      const program = this.createProgram(tsConfig, configPath);
      const tsDiagnostics = this.getCompilerDiagnostics(program);
      
      const rawDiagnostics = this.convertDiagnostics(tsDiagnostics);
      const diagnostics = this.mapper.mapArray(rawDiagnostics);

      return ok(diagnostics);
    } catch (error) {
      if (error instanceof DiagnosticError) {
        return err(error);
      }
      
      return err(
        new DiagnosticError(
          'TypeScript compilation check failed',
          { source: 'typescript' },
          error instanceof Error ? error : undefined
        )
      );
    }
  }

  /**
   * Resolve TypeScript config path
   * @param config Collection configuration
   * @returns Config file path
   */
  private resolveConfigPath(config: CollectionConfig): string {
    return config.configPath ?? 'tsconfig.json';
  }

  /**
   * Read TypeScript configuration file
   * @param configPath Config file path
   * @returns Parsed config
   */
  private readTypeScriptConfig(configPath: string): ts.ParsedCommandLine {
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile.bind(ts.sys));

    if (configFile.error !== undefined) {
      throw new DiagnosticError(
        'Failed to read tsconfig.json',
        { source: 'typescript', configPath }
      );
    }

    const configDir = this.getConfigDirectory(configPath);
    
    return ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      configDir
    );
  }

  /**
   * Get configuration directory
   * @param configPath Config file path
   * @returns Directory path
   */
  private getConfigDirectory(configPath: string): string {
    const dir = configPath.replace(/[^\\/]+$/, '');
    return dir === '' ? './' : dir;
  }

  /**
   * Create TypeScript program
   * @param config Parsed config
   * @param configPath Config file path
   * @returns TypeScript program
   */
  private createProgram(config: ts.ParsedCommandLine, _configPath: string): ts.Program {
    return ts.createProgram(config.fileNames, config.options);
  }

  /**
   * Get compiler diagnostics
   * @param program TypeScript program
   * @returns Diagnostics array
   */
  private getCompilerDiagnostics(program: ts.Program): readonly ts.Diagnostic[] {
    return ts.getPreEmitDiagnostics(program);
  }

  /**
   * Convert TypeScript diagnostics to raw format
   * @param diagnostics TypeScript diagnostics
   * @returns Raw diagnostic data array
   */
  private convertDiagnostics(diagnostics: readonly ts.Diagnostic[]): RawDiagnosticData[] {
    const mapped: RawDiagnosticData[] = [];

    for (const diagnostic of diagnostics) {
      const converted = this.convertSingleDiagnostic(diagnostic);
      if (converted !== null) {
        mapped.push(converted);
      }
    }

    return mapped;
  }

  /**
   * Convert single TypeScript diagnostic
   * @param diagnostic TypeScript diagnostic
   * @returns Raw diagnostic data or null if no file
   */
  private convertSingleDiagnostic(diagnostic: ts.Diagnostic): RawDiagnosticData | null {
    const file = diagnostic.file;
    
    if (file === undefined || diagnostic.start === undefined) {
      return null;
    }

    const position = this.getPosition(file, diagnostic.start);
    const severity = this.mapSeverity(diagnostic.category);
    const message = this.formatMessage(diagnostic.messageText);

    return {
      filePath: file.fileName,
      line: position.line,
      column: position.column,
      severity,
      code: String(diagnostic.code),
      message,
      source: 'typescript',
    };
  }

  /**
   * Get line and column position
   * @param file Source file
   * @param start Start position
   * @returns Position object
   */
  private getPosition(file: ts.SourceFile, start: number): { line: number; column: number } {
    const { line, character } = file.getLineAndCharacterOfPosition(start);
    
    return {
      line: line + 1, // Convert to 1-based
      column: character + 1, // Convert to 1-based
    };
  }

  /**
   * Map TypeScript category to severity
   * @param category Diagnostic category
   * @returns Severity string
   */
  private mapSeverity(category: ts.DiagnosticCategory): 'error' | 'warning' {
    return category === ts.DiagnosticCategory.Error ? 'error' : 'warning';
  }

  /**
   * Format diagnostic message
   * @param messageText Message text or chain
   * @returns Formatted message string
   */
  private formatMessage(messageText: string | ts.DiagnosticMessageChain): string {
    return ts.flattenDiagnosticMessageText(messageText, '\n');
  }
}
