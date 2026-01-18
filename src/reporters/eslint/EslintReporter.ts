/**
 * ESLint reporter - main entry point for ESLint diagnostics
 * @module reporters/eslint/EslintReporter
 */

import { BaseDiagnosticSource, type ILogger, type Diagnostic } from '../../core/index.js';

import { EslintAdapter } from './EslintAdapter.js';

import type { CollectionConfig } from '../../domain/index.js';


/**
 * ESLint diagnostic source
 */
export class EslintReporter extends BaseDiagnosticSource {
	private adapter: EslintAdapter;

	public constructor(logger: ILogger, private readonly verbose: boolean = false) {
		super('eslint');
		this.adapter = new EslintAdapter(logger, verbose);
	}

	protected async doDiagnosticCollection(config: CollectionConfig): Promise<readonly Diagnostic[]> {
		return this.adapter.lint(config.patterns, config.configPath);
	}
}
