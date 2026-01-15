#!/usr/bin/env node

/**
 * OmnyReporter CLI Entry Point
 */

import { runCli } from '../dist/view/cli/App.js';

async function main() {
	try {
		await runCli();
	} catch (error) {
		console.error('Fatal error:', error instanceof Error ? error.message : String(error));
		if (process.env.DEBUG) {
			console.error(error);
		}
		process.exit(1);
	}
}

main().catch(() => process.exit(1));
