/**
 * CLI diagnostics command
 * @module cli/diagnostics
 */

import type { CollectionConfig } from '../domain/index.js';
import { CollectDiagnosticsUseCase } from '../application/usecases/CollectDiagnostics.js';
import { EslintReporter } from '../reporters/eslint/EslintReporter.js';
import type { ILogger } from '../core/index.js';
import { DiagnosticAggregator } from '../domain/index.js';

/**
 * Execute diagnostics collection
 * @param config Collection configuration
 * @param logger Logger instance
 * @returns void (logs results)
 */
export async function executeDiagnostics(
  config: CollectionConfig,
  logger: ILogger
): Promise<void> {
  try {
    logger.info('Starting diagnostics collection', {
      eslint: config.eslint,
      typescript: config.typescript,
    });

    const sources = [];
    if (config.eslint) {
      sources.push(new EslintReporter(logger));
    }

    const useCase = new CollectDiagnosticsUseCase(sources, DiagnosticAggregator);
    const result = await useCase.execute(config);

    if (result.isOk()) {
      logger.info('Diagnostics collection completed', {
        diagnosticsCount: result.value.length,
      });
    } else {
      logger.error('Diagnostics collection failed', { error: result.error });
      throw result.error;
    }
  } catch (error) {
    logger.error('Failed to execute diagnostics', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
