/**
 * Report Generator
 * Orchestrates diagnostic collection, aggregation, and analytics
 * @module application/ReportGenerator
 */

import { injectable, multiInject, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import {
	DiagnosticError,
	ok,
	err,
	type DiagnosticIntegration,
	type Diagnostic,
	type DiagnosticStatistics,
	type Result,
	type ILogger,
	IntegrationName,
} from '@core';
import { type CollectionConfig } from '@domain';
import { DiagnosticAnalytics } from '@domain/analytics/DiagnosticAnalytics.js';

/**
 * Integration statistics
 */
export interface IntegrationStatistics {
	readonly total: number;
	readonly successful: number;
	readonly failed: number;
}

/**
 * Result of report generation
 */
export interface ReportResult {
	readonly diagnostics: readonly Diagnostic[];
	readonly stats: DiagnosticStatistics;
	readonly integrationStats: IntegrationStatistics;
}

/**
 * Use-case for generating diagnostic reports
 * Returns data without writing - writing handled by ApplicationService
 *
 * Dependencies:
 * - integrations: Diagnostic integrations (ESLint, TypeScript reporters)
 * - analytics: Calculates statistics (uses DiagnosticAnalytics for collectAll batch method)
 */
@injectable()
export class ReportGenerator {
	public constructor(
		@multiInject(TOKENS.DIAGNOSTIC_INTEGRATION) private readonly integrations: DiagnosticIntegration[],
		@inject(TOKENS.DIAGNOSTIC_ANALYTICS) private readonly analytics: DiagnosticAnalytics,
		@inject(TOKENS.LOGGER) private readonly logger: ILogger
	) {}

	public async generate(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
		try {
			// Filter integrations based on configuration
			const activeIntegrations = this.filterActiveIntegrations(config);

			if (activeIntegrations.length === 0) {
				return err(
					new DiagnosticError('No diagnostic integrations enabled', {
						config: { eslint: config.eslint, typescript: config.typescript },
					})
				);
			}

			this.logger.info('Collecting diagnostics from integrations', {
				integrations: activeIntegrations.map((s) => s.getName()),
				total: activeIntegrations.length,
			});

			const { diagnostics, successCount } = await this.collectFromIntegrationsWithTimeout(
				activeIntegrations,
				config
			);

			this.logger.info('Diagnostic collection completed', {
				collected: diagnostics.length,
				successful: successCount,
				failed: activeIntegrations.length - successCount,
			});

			if (successCount === 0) {
				return err(
					new DiagnosticError('All diagnostic integrations failed', {
						total: activeIntegrations.length,
						failed: activeIntegrations.length,
					})
				);
			}

			// Calculate statistics
			this.analytics.reset();
			this.analytics.collectAll(diagnostics);
			const stats = this.analytics.getSnapshot();

			return ok({
				diagnostics,
				stats,
				integrationStats: {
					total: activeIntegrations.length,
					successful: successCount,
					failed: activeIntegrations.length - successCount,
				},
			});
		} catch (error) {
			return err(
				new DiagnosticError('Failed to generate report', {}, error instanceof Error ? error : undefined)
			);
		}
	}

	private filterActiveIntegrations(config: CollectionConfig): readonly DiagnosticIntegration[] {
		return this.integrations.filter((integration) => {
			const name = integration.getName();

			// Check ESLint flag
			if (name.includes(IntegrationName.ESLint)) {
				return !config.eslint ? false : true;
			}

			// Check TypeScript flag
			if (name.includes(IntegrationName.TypeScript)) {
				return !config.typescript ? false : true;
			}

			// Include other integrations (vitest, etc.) by default
			return true;
		});
	}

	private async collectFromIntegrationsWithTimeout(
		integrations: readonly DiagnosticIntegration[],
		config: CollectionConfig
	): Promise<{ diagnostics: readonly Diagnostic[]; successCount: number }> {
		const results = await Promise.allSettled(
			integrations.map(async (integration) => this.collectWithTimeout(integration, config))
		);

		return this.aggregateSettledResults(results);
	}

	private aggregateSettledResults(
		settledResults: readonly PromiseSettledResult<Result<readonly Diagnostic[], DiagnosticError>>[]
	): { diagnostics: readonly Diagnostic[]; successCount: number } {
		const diagnostics: Diagnostic[] = [];
		let successCount = 0;

		for (const settledResult of settledResults) {
			if (settledResult.status === 'fulfilled') {
				const integrationResult = settledResult.value;
				if (integrationResult.isOk()) {
					diagnostics.push(...integrationResult.value);
					successCount += 1;
				}
			}
		}

		return { diagnostics, successCount };
	}

	private async collectWithTimeout(
		integration: DiagnosticIntegration,
		config: CollectionConfig
	): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
		const timeout = config.timeout;
		const hasTimeout = timeout > 0;

		if (!hasTimeout) {
			return integration.collect(config);
		}

		return Promise.race([integration.collect(config), this.createTimeoutPromise(timeout, integration.getName())]);
	}

	private async createTimeoutPromise(ms: number, integrationName: string): Promise<never> {
		return new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(
					new DiagnosticError(`Integration ${integrationName} timed out after ${String(ms)}ms`, {
						integration: integrationName,
						timeout: ms,
					})
				);
			}, ms);
		});
	}
}
