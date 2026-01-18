/**
 * TypeScript reporter - main entry point for TypeScript diagnostics
 * @module reporters/typescript/TypeScriptReporter
 */

import { BaseDiagnosticSource ,type  ILogger, type Diagnostic } from '../../core/index.js';

import { TypeScriptAdapter } from './TypeScriptAdapter.js';

import type { CollectionConfig } from '../../domain/index.js';


/**
 * TypeScript diagnostic source
 */
export class TypeScriptReporter extends BaseDiagnosticSource {
	private adapter: TypeScriptAdapter;

	public constructor(logger: ILogger, private readonly verbose: boolean = false) {
		super('typescript');
		this.adapter = new TypeScriptAdapter(logger, verbose);
	}

	protected async doDiagnosticCollection(config: CollectionConfig): Promise<readonly Diagnostic[]> {
		return this.adapter.check(config.configPath ?? 'tsconfig.json');
	}
}
