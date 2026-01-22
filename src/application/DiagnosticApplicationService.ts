/**
 * Diagnostic Application Service
 * High-level orchestrator for diagnostic reporting workflow
 * @module application/DiagnosticApplicationService
 */

import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/container';
import {
	DiagnosticError,
	ok,
	err,
	type Result,
	type WriteStats,
	type ILogger,
	type DiagnosticFileReport,
	type Diagnostic,
	type IntegrationName,
	type IFileSystem,
} from '@core';
import { type CollectionConfig, DiagnosticGrouper, FileReportBuilder } from '@domain';
import { DirectoryService, StructuredReportWriter } from '@infrastructure/filesystem/index.js';
import { ReportGenerator, type ReportResult } from './ReportGeneratorManager.js';

/**
 * Complete diagnostic reporting result
 */
export interface DiagnosticReportingResult extends ReportResult {
	readonly writeStats: WriteStats;
}

/**
 * Application service coordinating diagnostic reporting workflow
 */
@injectable()
export class DiagnosticApplicationService {
	private readonly reportBuilder: FileReportBuilder;
	private readonly diagnosticGrouper: DiagnosticGrouper;

	public constructor(
		@inject(TOKENS.LOGGER) private readonly logger: ILogger,
		@inject(TOKENS.REPORT_GENERATOR)
		private readonly reportGenerator: ReportGenerator,
		@inject(TOKENS.STRUCTURED_REPORT_WRITER) private readonly writer: StructuredReportWriter,
		@inject(TOKENS.DIRECTORY_SERVICE) private readonly directoryService: DirectoryService,
		@inject(TOKENS.FILE_SYSTEM) private readonly fileSystem: IFileSystem
	) {
		this.reportBuilder = new FileReportBuilder(this.fileSystem, this.logger);
		this.diagnosticGrouper = new DiagnosticGrouper();
	}

	public async run(config: CollectionConfig): Promise<Result<DiagnosticReportingResult, DiagnosticError>> {
		try {
			this.logWorkflowStart(config);
			await this.clearPreviousErrors();

			const reportResult = await this.collectDiagnostics(config);

			if (!reportResult.isOk()) {
				return err(reportResult.error);
			}

			const { diagnostics, stats, integrationStats } = reportResult.value;
			this.logCollectionSuccess(diagnostics.length, stats, integrationStats);

			const rootPath = config.rootPath ?? '.';
			const fileReports = await this.buildFileReports(diagnostics, rootPath);

			const writeResult = await this.writeReports(fileReports);
			if (!writeResult.isOk()) {
				return this.handleWriteError(writeResult.error);
			}

			this.logWorkflowSuccess(diagnostics.length, writeResult.value);

			return ok({
				diagnostics,
				stats,
				integrationStats,
				writeStats: writeResult.value,
			});
		} catch (error) {
			return this.handleUnexpectedError(error);
		}
	}

	/**
	 * Log workflow start
	 */
	private logWorkflowStart(config: CollectionConfig): void {
		this.logger.info('Step 1/4: Starting diagnostic report generation', {
			patterns: config.patterns.length,
			eslint: config.eslint,
			typescript: config.typescript,
		});
	}

	/**
	 * Clear previous errors
	 */
	private async clearPreviousErrors(): Promise<void> {
		this.logger.info('Step 2/4: Clearing previous errors');
		await this.directoryService.clearAllErrors();
	}

	/**
	 * Collect diagnostics
	 */
	private async collectDiagnostics(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
		this.logger.info('Step 3/4: Collecting and analyzing diagnostics');
		return this.reportGenerator.generate(config);
	}

	/**
	 * Log collection success
	 */
	private logCollectionSuccess(
		count: number,
		stats: ReportResult['stats'],
		integrationStats: ReportResult['integrationStats']
	): void {
		this.logger.info('Collection completed', {
			totalDiagnostics: count,
			errors: stats.errorCount,
			warnings: stats.warningCount,
			integrations: {
				successful: integrationStats.successful,
				failed: integrationStats.failed,
			},
		});
	}

	/**
	 * Build file reports
	 */
	private async buildFileReports(
		diagnostics: readonly Diagnostic[],
		rootPath: string
	): Promise<Map<IntegrationName, readonly DiagnosticFileReport[]>> {
		this.logger.info('Step 4/4: Building file reports');

		const grouped = this.diagnosticGrouper.group(diagnostics);
		const result = new Map<IntegrationName, readonly DiagnosticFileReport[]>();

		for (const [integration, fileMap] of grouped) {
			const reports = await this.buildReportsForIntegration(integration, fileMap, rootPath);
			result.set(integration, reports);
		}

		return result;
	}

	/**
	 * Build reports for single integration
	 */
	private async buildReportsForIntegration(
		integration: IntegrationName,
		fileMap: Map<string, Diagnostic[]>,
		rootPath: string
	): Promise<DiagnosticFileReport[]> {
		const reports: DiagnosticFileReport[] = [];

		for (const [filePath, fileDiagnostics] of fileMap) {
			const report = await this.reportBuilder.buildReport(integration, filePath, fileDiagnostics, rootPath);
			reports.push(report);
		}

		return reports;
	}

	/**
	 * Write reports to files
	 */
	private async writeReports(
		reports: Map<IntegrationName, readonly DiagnosticFileReport[]>
	): Promise<Result<WriteStats, Error>> {
		return this.writer.write(reports);
	}

	/**
	 * Handle write error
	 */
	private handleWriteError(error: Error): Result<DiagnosticReportingResult, DiagnosticError> {
		return err(new DiagnosticError('Failed to write report', {}, error instanceof Error ? error : undefined));
	}

	/**
	 * Log workflow success
	 */
	private logWorkflowSuccess(count: number, writeStats: WriteStats): void {
		this.logger.info('Diagnostic report completed successfully', {
			diagnosticCount: count,
			filesWritten: writeStats.filesWritten,
			duration: writeStats.duration,
		});
	}

	/**
	 * Handle unexpected error
	 */
	private handleUnexpectedError(error: unknown): Result<DiagnosticReportingResult, DiagnosticError> {
		this.logger.error('Failed to generate and write report', {
			error: error instanceof Error ? error.message : String(error),
		});

		return err(
			new DiagnosticError('Failed to generate and write report', {}, error instanceof Error ? error : undefined)
		);
	}
}
