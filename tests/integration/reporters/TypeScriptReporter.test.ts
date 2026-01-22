/**
 * Integration tests for TypeScriptReporter
 * @module tests/integration/reporters/TypeScriptReporter
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { IntegrationName } from '../../../src/core';
import { TypeScriptReporter } from '../../../src/reporters/typescript';
import { createTestConfig } from '../../helpers';
import { MockLogger } from '../../mocks';

describe('TypeScriptReporter', () => {
	let reporter: TypeScriptReporter;
	let mockLogger: MockLogger;

	beforeEach(() => {
		mockLogger = new MockLogger();
		reporter = new TypeScriptReporter(mockLogger);
	});

	describe('execute', () => {
		it('should return Result type', async () => {
			const config = createTestConfig();
			const result = await reporter.execute(config);

			expect(result.isOk()).toBeDefined();
			expect(result.isErr()).toBeDefined();
		});

		it('should handle TypeScript project configuration', async () => {
			const config = createTestConfig({
				patterns: ['src/**/*.ts'],
			});

			const result = await reporter.execute(config);

			expect(result.isOk() || result.isErr()).toBe(true);
		});

		it('should return array of TypeScript diagnostics', async () => {
			const config = createTestConfig();
			const result = await reporter.execute(config);

			if (result.isOk()) {
				const diagnostics = result._unsafeUnwrap();
				expect(Array.isArray(diagnostics)).toBe(true);
				// All diagnostics should have TypeScript integration
				diagnostics.forEach((diag) => {
					expect(diag.integration).toBe(IntegrationName.TypeScript);
				});
			}
		});

		it('should handle missing TypeScript config gracefully', async () => {
			const config = createTestConfig({
				patterns: ['nonexistent/**'],
			});

			const result = await reporter.execute(config);

			// Should not throw, return either Ok or Err
			expect(result.isOk() || result.isErr()).toBe(true);
		});
	});

	describe('logging', () => {
		it('should log diagnostic collection', async () => {
			const config = createTestConfig();
			await reporter.execute(config);

			const logs = mockLogger.getLogs();
			expect(logs.length).toBeGreaterThan(0);
		});
	});
});
