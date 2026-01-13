/**
 * JSON report writer with streaming support
 */

import fs from 'node:fs';
import path from 'node:path';

import { DirectoryManager } from './DirectoryManager.js';
import { SecurityValidatorImpl } from './SecurityValidator.js';

import type { Logger, ReportWriter } from '../interfaces.js';
import type { Diagnostic, WriteStats } from '../types.js';

export class JsonReportWriter implements ReportWriter {
	readonly #directoryManager: DirectoryManager;
	readonly #securityValidator: SecurityValidatorImpl;
	readonly #logger: Logger;

	public constructor(
		directoryManager: DirectoryManager,
		securityValidator: SecurityValidatorImpl,
		logger: Logger
	) {
		this.#directoryManager = directoryManager;
		this.#securityValidator = securityValidator;
		this.#logger = logger;
	}

	public async writeStream(source: AsyncIterable<Diagnostic>): Promise<WriteStats> {
		const startTime = Date.now();
		const diagnosticsByFile = new Map<string, Diagnostic[]>();
		const errors: Error[] = [];
		let totalDiagnostics = 0;

		// Group diagnostics by file
		try {
			for await (const diagnostic of source) {
				totalDiagnostics++;
				const filePath = diagnostic.filePath;

				if (!diagnosticsByFile.has(filePath)) {
					diagnosticsByFile.set(filePath, []);
				}

				const diagnosticsForFile = diagnosticsByFile.get(filePath);
				if (diagnosticsForFile !== undefined) {
					diagnosticsForFile.push(diagnostic);
				}
			}
		} catch (error) {
			this.#logger.error('Error reading diagnostic stream', { error });
			errors.push(error as Error);
		}

		// Determine type from first diagnostic
		const firstDiagnostic = Array.from(diagnosticsByFile.values())[0]?.[0];
		const type = firstDiagnostic?.source ?? 'eslint';

		// Ensure directories exist
		await this.#directoryManager.ensureDirectories(type);

		// Write files
		let filesWritten = 0;
		let bytesWritten = 0;

		for (const [filePath, diagnostics] of diagnosticsByFile.entries()) {
			try {
				const outputPath = this.#directoryManager.getFilePath(type, filePath);
				
				// Security check
				if (!this.#securityValidator.isPathSafe(outputPath)) {
					this.#logger.warn('Skipping unsafe output path', { path: outputPath });
					continue;
				}

				// Ensure parent directory exists
				await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

				// Write JSON file
				const json = JSON.stringify(diagnostics, null, 2);
				await fs.promises.writeFile(outputPath, json, 'utf8');

				filesWritten++;
				bytesWritten += Buffer.byteLength(json, 'utf8');
			} catch (error) {
				this.#logger.error('Error writing diagnostic file', { filePath, error });
				errors.push(error as Error);
			}
		}

		const durationMs = Date.now() - startTime;
		
		this.#logger.info('Diagnostics written', {
			filesWritten,
			bytesWritten,
			durationMs,
			totalDiagnostics,
		});

		return {
			filesWritten,
			bytesWritten,
			durationMs,
			errors,
		};
	}

	public getOutputPath(type: 'eslint' | 'typescript'): string {
		return this.#directoryManager.getOutputDir(type);
	}
}
