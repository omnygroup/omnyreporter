/**
 * Main CLI entry point
 */

import { runDiagnosticsCli } from './diagnostics.js';

export async function main(args: string[]): Promise<void> {
	const command = args[0];
	const commandArgs = args.slice(1);

	switch (command) {
		case 'diagnostics':
		case 'report':
			await runDiagnosticsCli(commandArgs);
			break;
		case undefined:
		default: {
			const commandName = command ?? '(none)';
			console.error(`Unknown command: ${commandName}`);
			console.error('Available commands: diagnostics, report');
			process.exit(1);
		}
	}
}
