/**
 * File Report Builder
 * Builds diagnostic file reports with source code
 * @module domain/reporting/FileReportBuilder
 */

import { DiagnosticAnalytics } from '@domain/analytics/DiagnosticAnalytics.js';

import type { Diagnostic, DiagnosticFileReport, IntegrationName, IFileSystem, ILogger } from '@core';

/**
 * Builds enriched file reports from diagnostics
 * Single responsibility: create DiagnosticFileReport with file content
 */
export class FileReportBuilder {
	public constructor(
		private readonly fileSystem: IFileSystem,
		private readonly logger: ILogger
	) {}

	public async buildReport(
		integration: IntegrationName,
		filePath: string,
		diagnostics: readonly Diagnostic[],
		rootPath: string
	): Promise<DiagnosticFileReport> {
		const fileContent = await this.readFileContent(filePath);
		const absolutePath = this.resolveAbsolutePath(filePath, rootPath);
		const severityCounts = DiagnosticAnalytics.calculateSeverityCounts(diagnostics);

		return {
			filePath,
			absolutePath,
			sourceCode: fileContent.content,
			encoding: fileContent.encoding,
			lineCount: fileContent.lineCount,
			size: fileContent.size,
			diagnostics,
			metadata: {
				instrument: integration,
				timestamp: new Date(),
				diagnosticCount: diagnostics.length,
				...severityCounts,
			},
		};
	}

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

	private countLines(content: string): number {
		return content.split('\n').length;
	}

	private resolveAbsolutePath(filePath: string, rootPath: string): string {
		if (filePath.startsWith('/')) {
			return filePath;
		}

		return `${rootPath}/${filePath}`;
	}
}
