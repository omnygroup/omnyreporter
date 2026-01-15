/**
 * Structured report writer
 * Writes diagnostic reports to organized file structure
 * @module infrastructure/filesystem/StructuredReportWriter
 */

import { injectable } from 'inversify';

import { FileSystemError, type DiagnosticFileReport, type DiagnosticSource, type IFileSystem, type ILogger, type IPathService, type Result, type WriteStats, err, ok } from '@core';
import { DirectoryService } from './DirectoryService.js';
import { DiagnosticMapper } from '@domain/mappers/index.js';

/**
 * Writes diagnostic file reports to structured directory layout
 * Organizes reports by instrument (eslint/typescript/vitest) and file
 */
@injectable()
export class StructuredReportWriter {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly pathService: IPathService,
    private readonly directoryService: DirectoryService,
    private readonly logger: ILogger
  ) {}

  /**
   * Write enriched diagnostic reports to structured files
   * @param reports Map of instrument to diagnostic reports
   * @returns Result with write statistics
   */
  public async write(
    reports: Map<DiagnosticSource, readonly DiagnosticFileReport[]>
  ): Promise<Result<WriteStats, Error>> {
    const startTime = Date.now();
    let totalFiles = 0;
    let totalBytes = 0;

    try {
      for (const [source, fileReports] of reports) {
        // Skip if no reports for this source
        if (fileReports.length === 0) {
          continue;
        }

        // Ensure errors directory exists
        const errorsDir = this.directoryService.getInstrumentErrorsDirectory(source);
        await this.fileSystem.ensureDir(errorsDir);

        // Write each file report
        for (const report of fileReports) {
          const result = await this.writeFileReport(source, report, errorsDir);

          if (!result.isOk()) {
            return err(result.error);
          }

          totalFiles += 1;
          totalBytes += result.value;
        }

        this.logger.info(`Wrote ${fileReports.length} diagnostic files for ${source}`, {
          source,
          count: fileReports.length,
        });
      }

      return ok({
        filesWritten: totalFiles,
        bytesWritten: totalBytes,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });
    } catch (error) {
      return err(
        new FileSystemError('Failed to write structured reports', {}, error as Error)
      );
    }
  }

  /**
   * Write single file report
   * @param source Diagnostic source
   * @param report File report to write
   * @param errorsDir Target errors directory
   * @returns Result with bytes written
   */
  private async writeFileReport(
    _source: DiagnosticSource,
    report: DiagnosticFileReport,
    errorsDir: string
  ): Promise<Result<number, Error>> {
    try {
      // Generate file name from path (replace slashes with underscores)
      const fileName = this.generateFileName(report.filePath);
      const filePath = `${errorsDir}/${fileName}`;

      // Serialize diagnostics using existing mapper
      const persistedDiagnostics = report.diagnostics.map((d) =>
        DiagnosticMapper.toPersistence(d)
      );

      // Create report payload
      const payload = {
        filePath: report.filePath,
        absolutePath: report.absolutePath,
        sourceCode: report.sourceCode,
        encoding: report.encoding,
        lineCount: report.lineCount,
        size: report.size,
        diagnostics: persistedDiagnostics,
        metadata: {
          instrument: report.metadata.instrument,
          timestamp: report.metadata.timestamp.toISOString(),
          diagnosticCount: report.metadata.diagnosticCount,
          errorCount: report.metadata.errorCount,
          warningCount: report.metadata.warningCount,
          infoCount: report.metadata.infoCount,
        },
      };

      // Write JSON file
      const stats = await this.fileSystem.writeJson(filePath, payload, {
        atomic: true,
        ensureDir: true,
      });

      return ok(stats.bytesWritten);
    } catch (error) {
      return err(
        new FileSystemError(
          `Failed to write file report for ${report.filePath}`,
          { filePath: report.filePath },
          error as Error
        )
      );
    }
  }

  /**
   * Generate JSON file name from file path
   * Replaces path separators with underscores
   * @param filePath File path (relative)
   * @returns JSON file name
   */
  private generateFileName(filePath: string): string {
    // Normalize separators and replace with underscores
    const normalized = this.pathService.normalize(filePath).replace(/\//g, '_');
    return `${normalized}.json`;
  }
}
