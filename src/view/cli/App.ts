/**
 * Main CLI application using yargs
 * @module view/cli/App
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as diagnosticsCommand from './commands/diagnostics.js';

// DiagnosticsOptions type removed: not required in this module

/**
 * Build and configure the CLI application
 * @returns Configured yargs instance
 */
export function getCliApp(): ReturnType<typeof yargs> {
	return yargs(hideBin(process.argv))
		.command({
			command: diagnosticsCommand.command,
			describe: diagnosticsCommand.describe,
			builder: diagnosticsCommand.builder,
			handler: diagnosticsCommand.handler,
		})
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
}

/**
 * Run the CLI application
 */
export async function runCli(): Promise<void> {
	const app = getCliApp();
	await app.argv;
}
