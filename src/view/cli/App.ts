/**
 * Main CLI application using yargs
 * @module view/cli/App
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as diagnosticsCommand from './commands/diagnostics.js';

/**
 * Build and configure the CLI application
 * @returns Configured yargs instance
 */
export function getCliApp() {
  let app = yargs(hideBin(process.argv))
    .command(
      diagnosticsCommand.command,
      diagnosticsCommand.describe,
      diagnosticsCommand.builder as any,
      diagnosticsCommand.handler as any
    )
    .option('verbose', {
      alias: 'v',
      describe: 'Enable verbose logging',
      type: 'boolean',
      default: false,
    })
    .option('quiet', {
      alias: 'q',
      describe: 'Suppress non-error output',
      type: 'boolean',
      default: false,
    })
    .help()
    .alias('help', 'h')
    .version(false)
    .strict();

  return app;
}

/**
 * Run the CLI application
 */
export async function runCli(): Promise<void> {
  const app = getCliApp();
  await app.argv;
}
