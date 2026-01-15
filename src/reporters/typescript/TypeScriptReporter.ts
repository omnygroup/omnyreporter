/**
 * TypeScript reporter - main entry point for TypeScript diagnostics
 * @module reporters/typescript/TypeScriptReporter
 */

import { BaseDiagnosticSource ,type  ILogger } from '../../core/index.js';

import { TypeScriptAdapter } from './TypeScriptAdapter.js';

import type { CollectionConfig } from '../../domain/index.js';


/**
 * TypeScript diagnostic source
 */
export class TypeScriptReporter extends BaseDiagnosticSource {
	private adapter: TypeScriptAdapter;

	public constructor(logger: ILogger) {
		super('typescript');
		this.adapter = new TypeScriptAdapter(logger);
	}

	protected async doDiagnosticCollection(config: CollectionConfig) {
		return this.adapter.check(config.configPath ?? 'tsconfig.json');
	}
}
