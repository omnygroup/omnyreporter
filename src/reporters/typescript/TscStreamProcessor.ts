/**
 * Stream processor for TypeScript diagnostics
 */

import ts from 'typescript';

import type { Logger, StreamProcessor } from '../interfaces.js';
import type { Diagnostic } from '../types.js';
import type { DiagnosticsParser } from './DiagnosticsParser.js';

export interface TscStreamProcessor extends StreamProcessor<Diagnostic> {
	/**
	 * Process TypeScript diagnostics into diagnostic stream
	 */
	processDiagnostics(diagnostics: ts.Diagnostic[]): AsyncIterable<Diagnostic>;
}

export class TscStreamProcessorImpl implements TscStreamProcessor {
	readonly #parser: DiagnosticsParser;
	readonly #logger: Logger;
	readonly #batchSize: number;
	#errorHandler?: (error: Error) => void;

	public constructor(
		parser: DiagnosticsParser,
		logger: Logger,
		batchSize = 100
	) {
		this.#parser = parser;
		this.#logger = logger;
		this.#batchSize = batchSize;
	}

	public async *processDiagnostics(diagnostics: ts.Diagnostic[]): AsyncIterable<Diagnostic> {
		try {
			this.#logger.debug('Processing TypeScript diagnostics', {
				count: diagnostics.length,
			});

			// Process in batches to avoid memory pressure
			for (let i = 0; i < diagnostics.length; i += this.#batchSize) {
				const batch = diagnostics.slice(i, i + this.#batchSize);
				const parsed = this.#parser.parse(batch);

				// Sort by file and line for consistent output
				parsed.sort((a, b) => {
					if (a.filePath !== b.filePath) {
						return a.filePath.localeCompare(b.filePath);
					}
					if (a.line !== b.line) {
						return a.line - b.line;
					}
					return a.column - b.column;
				});

				for (const diagnostic of parsed) {
					yield diagnostic;
				}

				// Allow event loop to process other tasks
				await new Promise(resolve => setImmediate(resolve));
			}
		} catch (error) {
			this.#logger.error('Error processing TypeScript diagnostics', { error });
			if (this.#errorHandler !== undefined) {
				this.#errorHandler(error as Error);
			}
			throw error;
		}
	}

	public async *pipe(input: AsyncIterable<ts.Diagnostic>): AsyncIterable<Diagnostic> {
		const diagnostics: ts.Diagnostic[] = [];
		
		for await (const diagnostic of input) {
			diagnostics.push(diagnostic);
		}

		yield* this.processDiagnostics(diagnostics);
	}

	public onError(handler: (error: Error) => void): void {
		this.#errorHandler = handler;
	}
}
