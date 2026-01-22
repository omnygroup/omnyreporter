/**
 * Factory functions for creating test data
 * @module tests/mocks/factory
 */

import { Diagnostic, IntegrationName } from '../../src/core/types/diagnostic/index.js';

import type { Statistics } from '../../src/core/types/index.js';

function mapIntegration(integration: 'eslint' | 'typescript' | 'vitest'): IntegrationName {
	switch (integration) {
		case 'eslint':
			return IntegrationName.ESLint;
		case 'typescript':
			return IntegrationName.TypeScript;
		case 'vitest':
			return IntegrationName.Vitest;
	}
}

export function createTestDiagnostic(overrides?: {
	id?: string;
	integration?: 'eslint' | 'typescript' | 'vitest';
	filePath?: string;
	line?: number;
	column?: number;
	severity?: 'error' | 'warning' | 'info' | 'note';
	code?: string;
	message?: string;
}): Diagnostic {
	const integration = overrides?.integration ?? 'eslint';
	return new Diagnostic({
		integration: mapIntegration(integration),
		filePath: overrides?.filePath ?? '/test/file.ts',
		line: overrides?.line ?? 1,
		column: overrides?.column ?? 1,
		severity: overrides?.severity ?? 'error',
		code: overrides?.code ?? 'test-rule',
		message: overrides?.message ?? 'Test diagnostic message',
	});
}

export function createTestStatistics(overrides?: Partial<Statistics>): Statistics {
	return {
		integration: 'eslint',
		totalCount: 5,
		errorCount: 2,
		warningCount: 3,
		infoCount: 0,
		noteCount: 0,
		timestamp: new Date(),
		...overrides,
	};
}

export function createTestDiagnostics(
	count: number,
	integration: 'eslint' | 'typescript' | 'vitest' = 'eslint'
): Diagnostic[] {
	return Array.from({ length: count }, (_, i) =>
		createTestDiagnostic({
			integration,
			filePath: `/test/file-${String(i)}.ts`,
			line: i + 1,
			message: `Test diagnostic ${String(i)}`,
		})
	);
}
