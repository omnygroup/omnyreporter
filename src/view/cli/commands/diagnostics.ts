/**
 * Diagnostics CLI command
 * @module view/cli/commands/diagnostics
 */

import { getContainer, TOKENS } from '@/di/container';
import { GenerateReportUseCase } from '@application/usecases/GenerateReport';
import { type ILogger, type Diagnostic, type IFormatter } from '@core';
import { SourceCodeEnricher } from '@domain/mappers/SourceCodeEnricher';
import { DirectoryService, StructuredReportWriter } from '@infrastructure/filesystem';
import { EslintReporter } from '@reporters/eslint/EslintReporter';
import { TypeScriptReporter } from '@reporters/typescript/TypeScriptReporter';

import type { CollectionConfig } from '@domain/index.js';
import type { Arguments, CommandBuilder, Argv } from 'yargs';

export interface DiagnosticsOptions extends Arguments {
  patterns?: string[];
  eslint?: boolean;
  typescript?: boolean;
  format: 'json' | 'pretty' | 'table';
  output?: string;
  verbose: boolean;
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
      default: ['.'],
    })
    .option('eslint', {
      describe: 'Run ESLint (defaults to true if no other tool specified)',
      type: 'boolean',
    })
    .option('typescript', {
      describe: 'Run TypeScript checking (defaults to true if no other tool specified)',
      type: 'boolean',
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
    const logger = container.get<ILogger>(TOKENS.LOGGER);

    // Filter tools based on user flags
    // If no flags are provided, both run. If one is provided, only that one runs.
    const runEslint = argv.eslint ?? argv.typescript !== true;
    const runTypescript = argv.typescript ?? argv.eslint !== true;

    if (argv.verbose) {
      logger.info('Starting diagnostics collection', {
        patterns: argv.patterns,
        eslint: runEslint,
        typescript: runTypescript,
        format: argv.format,
      });
    }

    // Build collection config
    const config: CollectionConfig = {
      patterns: argv.patterns ?? ['src/**/*.ts', 'src/**/*.tsx'],
      rootPath: process.cwd(),
      concurrency: 4,
      timeout: 30000,
      cache: false,
      ignorePatterns: [],
      eslint: runEslint,
      typescript: runTypescript,
      configPath: undefined,
      verboseLogging: argv.verbose,
    };

    // Build list of diagnostic sources
    const sources = [];
    if (runEslint) {
      sources.push(new EslintReporter(logger, argv.verbose));
    }
    if (runTypescript) {
      sources.push(new TypeScriptReporter(logger, argv.verbose));
    }

    if (sources.length === 0) {
      logger.warn('No diagnostic sources enabled. Use --eslint or --typescript to enable sources.');
      return;
    }

    // Create report generation use case with required dependencies    
    const enricher = container.get<SourceCodeEnricher>(TOKENS.SOURCE_CODE_ENRICHER);
    const writer = container.get<StructuredReportWriter>(TOKENS.STRUCTURED_REPORT_WRITER);
    const directoryService = container.get<DirectoryService>(TOKENS.DIRECTORY_SERVICE);
    const useCase = new GenerateReportUseCase(sources, enricher, writer, directoryService);

    // Execute report generation (collects + writes to files)
    const result = await useCase.execute(config);

    if (!result.isOk()) {
      logger.error('Failed to generate report', result.error);
      console.error('\nError:', result.error.message);
      process.exit(1);
    }

    const { diagnostics, writeStats } = result.value;

    // Get formatter based on format option for console output
    if (argv.format === 'json') {
      const formatter = container.get<IFormatter<readonly Diagnostic[]>>(TOKENS.JSON_FORMATTER);
      const output = formatter.format(diagnostics);
      process.stdout.write(output + '\n');
    } else if (argv.format === 'table') {
      const formatter = container.get<IFormatter<readonly Diagnostic[]>>(TOKENS.TABLE_FORMATTER);
      const output = formatter.format(diagnostics);
      process.stdout.write(output + '\n');
    } else {
      // pretty format
      const formatter = container.get<IFormatter<Diagnostic>>(TOKENS.CONSOLE_FORMATTER);
      diagnostics.forEach((d) => {
        const output = formatter.format(d);
        process.stdout.write(output + '\n');
      });
    }

    if (argv.verbose) {
      logger.info('Diagnostics collection completed', {
        count: diagnostics.length,
        format: argv.format,
        filesWritten: writeStats.filesWritten,
      });
    }

    process.stdout.write(`\nSuccessfully processed ${String(diagnostics.length)} issues.` + '\n');
    process.stdout.write(`Detailed reports written to .omnyreporter/ directory (${String(writeStats.filesWritten)} files).` + '\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Fatal error:', message);
    if (error instanceof Error && typeof error.stack === 'string') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
