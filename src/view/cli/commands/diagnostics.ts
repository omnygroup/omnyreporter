/**
 * Diagnostics CLI command
 * @module view/cli/commands/diagnostics
 */

import type { Arguments, CommandBuilder, Argv } from 'yargs';

import { getContainer, TOKENS } from '../../../container.js';
import type { ILogger, Diagnostic } from '../../../core/index.js';
import type { IFormatter } from '../../../core/index.js';
import type { CollectionConfig } from '../../../domain/index.js';
import { EslintReporter } from '../../../reporters/eslint/EslintReporter.js';
import { TypeScriptReporter } from '../../../reporters/typescript/TypeScriptReporter.js';
import { CollectDiagnosticsUseCase } from '../../../application/usecases/CollectDiagnostics.js';
import { DiagnosticAggregator } from '../../../domain/analytics/diagnostics/DiagnosticAggregator.js';

export interface DiagnosticsOptions extends Arguments {
  patterns?: string[];
  eslint: boolean;
  typescript: boolean;
  format: 'json' | 'pretty' | 'table';
  output?: string;
  help: boolean;
}

export const command = 'diagnostics [patterns..]';
export const describe = 'Collect diagnostics from ESLint and TypeScript';

export const builder: CommandBuilder<unknown, DiagnosticsOptions> = (yargs: Argv<unknown>): Argv<DiagnosticsOptions> => {
  return yargs
    .positional('patterns', {
      describe: 'Glob patterns for files to check',
      type: 'string',
      array: true,
      default: ['src/**/*.ts', 'src/**/*.tsx'],
    })
    .option('eslint', {
      describe: 'Run ESLint',
      type: 'boolean',
      default: true,
    })
    .option('typescript', {
      describe: 'Run TypeScript type checking',
      type: 'boolean',
      default: true,
    })
    .option('format', {
      describe: 'Output format',
      type: 'string',
      choices: ['json', 'pretty', 'table'] as const,
      default: 'pretty' as const,
    })
    .option('output', {
      describe: 'Output file path',
      type: 'string',
      alias: 'o',
    }) as Argv<DiagnosticsOptions>;
};

export async function handler(argv: DiagnosticsOptions): Promise<void> {
  try {
    const container = getContainer();
    const logger = container.get<ILogger>(TOKENS.Logger);

    logger.info('Starting diagnostics collection', {
      patterns: argv.patterns,
      eslint: argv.eslint,
      typescript: argv.typescript,
      format: argv.format,
    });

    // Build collection config
    const config: CollectionConfig = {
      patterns: argv.patterns ?? ['src/**/*.ts', 'src/**/*.tsx'],
      rootPath: process.cwd(),
      concurrency: 4,
      timeout: 30000,
      cache: false,
      ignorePatterns: [],
      eslint: argv.eslint,
      typescript: argv.typescript,
      configPath: undefined,
    };

    // Build list of diagnostic sources
    const sources = [];
    if (argv.eslint) {
      sources.push(new EslintReporter(logger));
    }
    if (argv.typescript) {
      sources.push(new TypeScriptReporter(logger));
    }

    if (sources.length === 0) {
      console.log('No diagnostic sources enabled. Use --eslint or --typescript to enable sources.');
      return;
    }

    // Create use case with sources
    const useCase = new CollectDiagnosticsUseCase(sources, DiagnosticAggregator);

    // Execute collection
    const result = await useCase.execute(config);

    if (!result.isOk()) {
      logger.error('Failed to collect diagnostics', result.error);
      console.error('Error:', result.error.message);
      process.exit(1);
    }

    const diagnostics = result.value;

    // Get formatter based on format option
    if (argv.format === 'json') {
      const formatter = container.get<IFormatter<readonly Diagnostic[], string>>(TOKENS.JsonFormatter);
      const output = formatter.format(diagnostics);
      console.log(output);
    } else if (argv.format === 'table') {
      const formatter = container.get<IFormatter<readonly Diagnostic[], string>>(TOKENS.TableFormatter);
      const output = formatter.format(diagnostics);
      console.log(output);
    } else {
      // pretty format
      const formatter = container.get<IFormatter<Diagnostic, string>>(TOKENS.ConsoleFormatter);
      diagnostics.forEach((d) => {
        const output = formatter.format(d);
        console.log(output);
      });
    }

    logger.info('Diagnostics collection completed', {
      count: diagnostics.length,
      format: argv.format,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Fatal error:', message);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
