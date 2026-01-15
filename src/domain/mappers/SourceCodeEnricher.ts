/**
 * Source code enricher
 * Orchestrates enrichment of diagnostics with source code
 * @module domain/mappers/SourceCodeEnricher
 */

import { injectable } from 'inversify';

import { DiagnosticError, type Diagnostic, type DiagnosticFileReport, type DiagnosticSource, type Result, err, ok } from '@core';
import { FileContentReader } from '@infrastructure/filesystem/index.js';
import { DiagnosticMetadataBuilder } from '@domain/analytics/diagnostics/index.js';
import { FileReportAssembler } from './FileReportAssembler.js';

/**
 * Enriches diagnostics with source code and metadata
 * Orchestrates FileContentReader, DiagnosticMetadataBuilder, FileReportAssembler
 */
@injectable()
export class SourceCodeEnricher {
  public constructor(private readonly fileContentReader: FileContentReader) {}

  /**
   * Enrich single file's diagnostics with source code
   * @param filePath Path to file
   * @param diagnostics Diagnostics for file
   * @param source Diagnostic source
   * @returns Result with enriched report
   */
  public async enrichFile(
    filePath: string,
    diagnostics: readonly Diagnostic[],
    source: DiagnosticSource
  ): Promise<Result<DiagnosticFileReport, Error>> {
    // Step 1: Read file content
    const contentResult = await this.fileContentReader.read(filePath);

    if (!contentResult.isOk()) {
      return err(contentResult.error);
    }

    // Step 2: Build metadata
    const metadata = DiagnosticMetadataBuilder.build(diagnostics, source);

    // Step 3: Assemble report
    const report = FileReportAssembler.assemble(contentResult.value, diagnostics, metadata);

    return ok(report);
  }

  /**
   * Enrich all diagnostics organized by source and file
   * @param grouped Map of source to map of file to diagnostics
   * @returns Result with map of enriched reports
   */
  public async enrichAll(
    grouped: Map<DiagnosticSource, Map<string, readonly Diagnostic[]>>
  ): Promise<Result<Map<DiagnosticSource, readonly DiagnosticFileReport[]>, Error>> {
    const enriched = new Map<DiagnosticSource, DiagnosticFileReport[]>();

    for (const [source, fileMap] of grouped) {
      const reports: DiagnosticFileReport[] = [];

      for (const [filePath, diagnostics] of fileMap) {
        const result = await this.enrichFile(filePath, diagnostics, source);

        if (!result.isOk()) {
          return err(
            new DiagnosticError(
              `Failed to enrich diagnostics for ${filePath}`,
              { filePath },
              result.error instanceof Error ? result.error : undefined
            )
          );
        }

        reports.push(result.value);
      }

      enriched.set(source, reports);
    }

    return ok(enriched);
  }
}
