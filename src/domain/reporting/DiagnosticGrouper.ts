/**
 * Diagnostic Grouper
 * Groups diagnostics by integration and file for structured reporting
 * @module domain/reporting/DiagnosticGrouper
 */

import type { Diagnostic } from '@core';
import type { IntegrationName } from '@core';

/**
 * Groups diagnostics by integration and file path
 */
export class DiagnosticGrouper {
	/**
	 * Group diagnostics by integration and file path
	 */
	public group(diagnostics: readonly Diagnostic[]): Map<IntegrationName, Map<string, Diagnostic[]>> {
		const grouped = new Map<IntegrationName, Map<string, Diagnostic[]>>();

		for (const diagnostic of diagnostics) {
			const fileMap = this.getOrCreateFileMap(grouped, diagnostic.integration);
			const diagnosticList = this.getOrCreateDiagnosticList(fileMap, diagnostic.filePath);
			diagnosticList.push(diagnostic);
		}

		return grouped;
	}

	private getOrCreateFileMap(
		grouped: Map<IntegrationName, Map<string, Diagnostic[]>>,
		integration: IntegrationName
	): Map<string, Diagnostic[]> {
		let fileMap = grouped.get(integration);

		if (fileMap === undefined) {
			fileMap = new Map<string, Diagnostic[]>();
			grouped.set(integration, fileMap);
		}

		return fileMap;
	}

	private getOrCreateDiagnosticList(fileMap: Map<string, Diagnostic[]>, filePath: string): Diagnostic[] {
		let diagnosticList = fileMap.get(filePath);

		if (diagnosticList === undefined) {
			diagnosticList = [];
			fileMap.set(filePath, diagnosticList);
		}

		return diagnosticList;
	}
}
