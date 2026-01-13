/**
 * Stream processor for ESLint results
 */

import type { Logger, StreamProcessor } from '../interfaces.js';
import type { Diagnostic } from '../types.js';
import type { LintResult } from './EslintLinter.js';
import type { LintMessageParser } from './LintMessageParser.js';

export interface LintStreamProcessor extends StreamProcessor<Diagnostic> {
	/**
	 * Process lint results into diagnostic stream
	 */
	processLintResults(results: LintResult[]): AsyncIterable<Diagnostic>;
}

export class LintStreamProcessorImpl implements LintStreamProcessor {
	readonly #parser: LintMessageParser;
	readonly #logger: Logger;
	readonly #batchSize: number;
	#errorHandler?: (error: Error) => void;

	public constructor(
		parser: LintMessageParser,
		logger: Logger,
		batchSize = 100
	) {
		this.#parser = parser;
		this.#logger = logger;
		this.#batchSize = batchSize;
	}

	public async *processLintResults(results: LintResult[]): AsyncIterable<Diagnostic> {
		try {
			this.#logger.debug('Processing lint results', { resultCount: results.length });

			// Process in batches to avoid memory pressure
			for (let i = 0; i < results.length; i += this.#batchSize) {
				const batch = results.slice(i, i + this.#batchSize);
				const diagnostics = this.#parser.parse(batch);

				for (const diagnostic of diagnostics) {
					yield diagnostic;
				}

				// Allow event loop to process other tasks
				await new Promise(resolve => setImmediate(resolve));
			}
		} catch (error) {
			this.#logger.error('Error processing lint results', { error });
			if (this.#errorHandler !== undefined) {
				this.#errorHandler(error as Error);
			}
			throw error;
		}
	}

	public async *pipe(input: AsyncIterable<LintResult>): AsyncIterable<Diagnostic> {
		const results: LintResult[] = [];
		
		for await (const result of input) {
			results.push(result);
		}

		yield* this.processLintResults(results);
	}

	public onError(handler: (error: Error) => void): void {
		this.#errorHandler = handler;
	}
}
