/**
 * File Report Builder
 * Builds diagnostic file reports with source code
 * @module application/FileReportBuilder
 */

import type { Diagnostic, DiagnosticFileReport, DiagnosticIntegration, IFileSystem, ILogger } from '@core';

/**
 * Builds enriched file reports from diagnostics
 * Single responsibility: create DiagnosticFileReport with file content
 */
export class FileReportBuilder {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly logger: ILogger
  ) {}

  /**
   * Build file report with source code
   * @param source Diagnostic source
   * @param filePath File path
   * @param diagnostics Diagnostics for file
   * @param rootPath Project root
   * @returns Diagnostic file report
   */
  public async buildReport(
    source: DiagnosticIntegration,
    filePath: string,
    diagnostics: readonly Diagnostic[],
    rootPath: string
  ): Promise<DiagnosticFileReport> {
    const fileContent = await this.readFileContent(filePath);
    const absolutePath = this.resolveAbsolutePath(filePath, rootPath);
    const severityCounts = this.calculateSeverityCounts(diagnostics);

    return {
      filePath,
      absolutePath,
      sourceCode: fileContent.content,
      encoding: fileContent.encoding,
      lineCount: fileContent.lineCount,
      size: fileContent.size,
      diagnostics,
      metadata: {
        instrument: source,
        timestamp: new Date(),
        diagnosticCount: diagnostics.length,
        ...severityCounts,
      },
    };
  }

  /**
   * Read file content
   * @param filePath File path
   * @returns File content data
   */
  private async readFileContent(filePath: string): Promise<{
    content: string;
    encoding: string;
    lineCount: number;
    size: number;
  }> {
    try {
      const content = await this.fileSystem.readFile(filePath);
      const lineCount = this.countLines(content);

      return {
        content,
        encoding: 'utf-8',
        lineCount,
        size: Buffer.byteLength(content, 'utf-8'),
      };
    } catch (error) {
      this.logger.warn('Could not read file', {
        filePath,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        content: '',
        encoding: 'utf-8',
        lineCount: 0,
        size: 0,
      };
    }
  }

  /**
   * Count lines in content
   * @param content File content
   * @returns Line count
   */
  private countLines(content: string): number {
    return content.split('\n').length;
  }

  /**
   * Resolve absolute path
   * @param filePath File path
   * @param rootPath Project root
   * @returns Absolute path
   */
  private resolveAbsolutePath(filePath: string, rootPath: string): string {
    // If already absolute, return as-is
    if (filePath.startsWith('/')) {
      return filePath;
    }

    return `${rootPath}/${filePath}`;
  }

  /**
   * Calculate severity counts
   * @param diagnostics Diagnostics array
   * @returns Severity counts
   */
  private calculateSeverityCounts(diagnostics: readonly Diagnostic[]): {
    errorCount: number;
    warningCount: number;
    infoCount: number;
  } {
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    for (const diagnostic of diagnostics) {
      if (diagnostic.severity === 'error') {
        errorCount += 1;
      } else if (diagnostic.severity === 'warning') {
        warningCount += 1;
      } else {
        infoCount += 1;
      }
    }

    return { errorCount, warningCount, infoCount };
  }
}
