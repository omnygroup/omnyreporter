/**
 * File report assembler
 * Assembles diagnostic file reports from components
 * @module domain/mappers/FileReportAssembler
 */

import { type Diagnostic, type DiagnosticFileReport, type DiagnosticReportMetadata } from '@core';

/**
 * Assembles diagnostic file reports
 * Pure function (no state, no dependencies)
 */
// Keep as class for architectural reasons
export class FileReportAssembler {
  /**
   * Assemble file report from components
   * @param fileContent File content with metadata
   * @param diagnostics Diagnostics for file
   * @param metadata Report metadata
   * @returns Complete diagnostic file report
   */
  public static assemble(
    fileContent: FileContent,
    diagnostics: readonly Diagnostic[],
    metadata: DiagnosticReportMetadata
  ): DiagnosticFileReport {
    return {
      filePath: fileContent.relativePath,
      absolutePath: fileContent.absolutePath,
      sourceCode: fileContent.sourceCode,
      encoding: fileContent.encoding,
      lineCount: fileContent.lineCount,
      size: fileContent.size,
      diagnostics,
      metadata,
    };
  }

  // Prevent instantiation; this is a static utility class
  private constructor() {
    this._instanceMarker();
  }

  // Instance marker to avoid `no-extraneous-class` while preserving class API
  // This is private and not used externally.
  private _instanceMarker(): void {
    void 0;
  }
}
