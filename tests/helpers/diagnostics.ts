/**
 * Diagnostic test helpers
 * @module tests/helpers/diagnostics
 */

import { Diagnostic, IntegrationName } from '../../src/core/types/diagnostic/index.js';

import type { DiagnosticSeverity } from '../../src/core/types/index.js';

type DiagnosticIntegrationType = 'eslint' | 'typescript' | 'vitest';

function mapIntegration(integration: DiagnosticIntegrationType): IntegrationName {
	switch (integration) {
		case 'eslint':
			return IntegrationName.ESLint;
		case 'typescript':
			return IntegrationName.TypeScript;
		case 'vitest':
			return IntegrationName.Vitest;
	}
}

/**
 * Builder pattern for creating test diagnostics
 */
export class DiagnosticTestBuilder {
	private integration: DiagnosticIntegrationType = 'eslint';
	private filePath = '/test/file.ts';
	private line = 1;
	private column = 1;
	private endLine?: number;
	private endColumn?: number;
	private severity: DiagnosticSeverity = 'error';
	private code = 'TEST-001';
	private message = 'Test message';

	withIntegration(integration: DiagnosticIntegrationType): this {
		this.integration = integration;
		return this;
	}

	withSeverity(severity: DiagnosticSeverity): this {
		this.severity = severity;
		return this;
	}

	withFilePath(filePath: string): this {
		this.filePath = filePath;
		return this;
	}

	withMessage(message: string): this {
		this.message = message;
		return this;
	}

	withCode(code: string): this {
		this.code = code;
		return this;
	}

	withLocation(line: number, column: number, endLine?: number, endColumn?: number): this {
		this.line = line;
		this.column = column;
		this.endLine = endLine;
		this.endColumn = endColumn;
		return this;
	}

	build(): Diagnostic {
		return new Diagnostic({
			integration: mapIntegration(this.integration),
			filePath: this.filePath,
			line: this.line,
			column: this.column,
			endLine: this.endLine,
			endColumn: this.endColumn,
			severity: this.severity,
			code: this.code,
			message: this.message,
		});
	}
}

export const mockDiagnosticBuilder = (): DiagnosticTestBuilder => new DiagnosticTestBuilder();
