/**
 * Diagnostics aggregator implementation
 */

import os from 'node:os';

import type { DiagnosticsAggregator } from '../interfaces.js';
import type { Diagnostic, DiagnosticsResult } from '../types.js';

export class DiagnosticsAggregatorImpl implements DiagnosticsAggregator {
	public async aggregate(stream: AsyncIterable<Diagnostic>): Promise<DiagnosticsResult> {
		const startTime = Date.now();
		const diagnostics: Diagnostic[] = [];
		const fileSet = new Set<string>();
		let errorCount = 0;
		let warningCount = 0;

		for await (const diagnostic of stream) {
			diagnostics.push(diagnostic);
			fileSet.add(diagnostic.filePath);
			
			if (diagnostic.severity === 'error') {
				errorCount++;
			} else {
				warningCount++;
			}
		}

		const processingTimeMs = Date.now() - startTime;

		return {
			diagnostics,
			summary: {
				totalFiles: fileSet.size,
				totalErrors: errorCount,
				totalWarnings: warningCount,
				processingTimeMs,
			},
			metadata: {
				reportedAt: new Date(),
				sourceVersion: undefined, // Will be set by specific reporters
				executedOn: os.hostname(),
			},
		};
	}
}
