/**
 * Integration tests for ReportGenerator
 * @module tests/integration/usecases/GenerateReport
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { ReportGenerator } from '../../../src/application/ReportGeneratorManager.js';
import { DiagnosticAnalytics } from '../../../src/domain/analytics/DiagnosticAnalytics';
import { createTestConfig } from '../../helpers/index.js';
import { MockDiagnosticIntegration, MockLogger, createTestDiagnostics } from '../../mocks';

import type { CollectionConfig } from '../../../src/domain/index.js';

describe('ReportGenerator', () => {
	let useCase: ReportGenerator;
	let mockIntegration: MockDiagnosticIntegration;
	let mockLogger: MockLogger;
	let analytics: DiagnosticAnalytics;

	beforeEach(() => {
		mockIntegration = new MockDiagnosticIntegration('eslint');
		mockLogger = new MockLogger();
		analytics = new DiagnosticAnalytics();

		useCase = new ReportGenerator([mockIntegration], analytics, mockLogger);
	});

	describe('generate', () => {
		it('should collect diagnostics from integrations', async () => {
			const diagnostics = createTestDiagnostics(3, 'eslint');
			mockIntegration.setDiagnostics(diagnostics);

			const config = createTestConfig();
			const result = await useCase.generate(config);

			expect(result.isOk()).toBe(true);
			expect(mockIntegration.getCallCount()).toBe(1);
		});

		it('should handle empty diagnostics', async () => {
			mockIntegration.setDiagnostics([]);

			const config = createTestConfig();
			const result = await useCase.generate(config);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.diagnostics).toHaveLength(0);
			}
		});

		it('should pass config to integrations', async () => {
			mockIntegration.setDiagnostics(createTestDiagnostics(1, 'eslint'));

			const config: CollectionConfig = {
				patterns: ['custom/**/*.ts'],
				rootPath: process.cwd(),
				concurrency: 2,
				timeout: 5000,
				cache: true,
				ignorePatterns: ['node_modules'],
				eslint: true,
				typescript: false,
				configPath: undefined,
				verboseLogging: false,
			};

			await useCase.generate(config);

			expect(mockIntegration.getCallCount()).toBe(1);
		});

		it('should return statistics with diagnostics', async () => {
			const diagnostics = createTestDiagnostics(5, 'eslint');
			mockIntegration.setDiagnostics(diagnostics);

			const config = createTestConfig();
			const result = await useCase.generate(config);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.stats).toBeDefined();
				expect(result.value.stats.totalCount).toBe(5);
				expect(result.value.integrationStats.successful).toBe(1);
			}
		});

		it('should return error when integration fails', async () => {
			mockIntegration.setError(new Error('Collection failed'));

			const config = createTestConfig();
			const result = await useCase.generate(config);

			// All integrations failed, should return error
			expect(result.isErr()).toBe(true);
		});
	});
});
