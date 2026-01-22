import { ESLint } from 'eslint';
import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import {
	BaseReportGenerator,
	IntegrationName,
	DiagnosticError,
	type Diagnostic,
	type Result,
	type ILogger,
} from '@core';

import { EslintLintResult } from './EslintLintResult.js';

import type { CollectionConfig } from '@domain';

@injectable()
export class EslintReporter extends BaseReportGenerator {
	public constructor(@inject(TOKENS.LOGGER) logger: ILogger) {
		super(logger);
	}

	protected getIntegrationName(): IntegrationName {
		return IntegrationName.ESLint;
	}

	protected async collectDiagnostics(
		config: CollectionConfig
	): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
		return this.runReporter(async () => {
			const eslint = new ESLint({
				overrideConfigFile: config.configPath ?? undefined,
				cwd: process.cwd(),
			});

			const lintResults = await this.runLinting(eslint, config.patterns);

			return lintResults.flatMap(({ filePath, messages }) =>
				messages.map((message) => new EslintLintResult(filePath, message).diagnostic)
			);
		}, 'ESLint linting failed');
	}

	private async runLinting(eslint: ESLint, patterns: readonly string[]): Promise<ESLint.LintResult[]> {
		try {
			return await eslint.lintFiles([...patterns]);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			if (/no files|no matching|nothing matched|matched no files/i.test(message)) {
				this.logger.info('ESLint: no files matched patterns', { patterns });
				return [];
			}

			throw error;
		}
	}
}
