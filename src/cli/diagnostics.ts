/**
 * CLI for diagnostic reporting
 */

import process from 'node:process';

import { ReportingOrchestrator } from '../reporters/ReportingOrchestrator.js';

import type { ReportingConfig } from '../reporters/ReportingConfig.js';

interface CliArgs {
	run: 'eslint' | 'typescript' | 'all';
	output?: string;
	timeout?: number;
	verbose?: boolean;
	exitOnError?: boolean;
	cwd?: string;
	patterns?: string[];
	passThroughArgs?: string[];
}

function parseArgs(args: string[]): CliArgs {
	const result: CliArgs = {
		run: 'all',
		verbose: false,
		exitOnError: true,
	};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];
		const next = args[i + 1];

		// Check for pass-through args separator
		if (arg === '--') {
			result.passThroughArgs = args.slice(i + 1);
			break;
		}

		const update = getArgumentUpdate(arg, next, args, i);
		applyUpdate(result, update);

		if (update.incrementBy > 0) {
			i += update.incrementBy;
		}

		i++;
	}

	return result;
}

interface ArgumentUpdate {
	property?: keyof Omit<CliArgs, 'passThroughArgs'>;
	value?: string | boolean | number | string[];
	incrementBy: number;
	shouldExit?: boolean;
}

function getArgumentUpdate(
	arg: string,
	next: string | undefined,
	args: string[],
	currentIndex: number,
): ArgumentUpdate {
	switch (arg) {
		case '--run': {
			if (next !== undefined && ['eslint', 'typescript', 'all'].includes(next)) {
				return {
					property: 'run',
					value: next,
					incrementBy: 1,
				};
			}
			return { incrementBy: 0 };
		}
		case '--output':
		case '-o': {
			if (next !== undefined) {
				return {
					property: 'output',
					value: next,
					incrementBy: 1,
				};
			}
			return { incrementBy: 0 };
		}
		case '--timeout':
		case '-t': {
			if (next !== undefined) {
				return {
					property: 'timeout',
					value: parseInt(next, 10),
					incrementBy: 1,
				};
			}
			return { incrementBy: 0 };
		}
		case '--patterns': {
			const patterns = collectPatterns(args, currentIndex);
			const increment = patterns.nextIndex - currentIndex - 1;
			return {
				property: 'patterns',
				value: patterns.collected,
				incrementBy: increment,
			};
		}
		case '--verbose':
		case '-v': {
			return {
				property: 'verbose',
				value: true,
				incrementBy: 0,
			};
		}
		case '--no-exit-on-error': {
			return {
				property: 'exitOnError',
				value: false,
				incrementBy: 0,
			};
		}
		case '--cwd': {
			if (next !== undefined) {
				return {
					property: 'cwd',
					value: next,
					incrementBy: 1,
				};
			}
			return { incrementBy: 0 };
		}
		case '--help':
		case '-h': {
			return {
				incrementBy: 0,
				shouldExit: true,
			};
		}
		default: {
			return { incrementBy: 0 };
		}
	}
}

function applyUpdate(result: CliArgs, update: ArgumentUpdate): void {
	if (update.shouldExit === true) {
		printHelp();
		process.exit(0);
	}

	if (update.property !== undefined && update.value !== undefined) {
		const typedResult = result as Record<keyof Omit<CliArgs, 'passThroughArgs'>, unknown>;
		typedResult[update.property] = update.value;
	}
}

function collectPatterns(
	args: string[],
	startIndex: number,
): { collected: string[]; nextIndex: number } {
	const patterns: string[] = [];
	let i = startIndex + 1;
	while (i < args.length) {
		const pattern = args[i];
		if (pattern === undefined || pattern.startsWith('-')) {
			break;
		}
		patterns.push(pattern);
		i++;
	}
	return {
		collected: patterns,
		nextIndex: i,
	};
}

function printHelp(): void {
	console.error(`
omny diagnostics - Report ESLint and TypeScript diagnostics

USAGE:
  omny diagnostics [OPTIONS] [-- PASS_THROUGH_ARGS]

OPTIONS:
  --run <type>              Which reporters to run: eslint, typescript, or all (default: all)
  --output, -o <dir>        Output directory (default: .omnyreporter)
  --timeout, -t <ms>        Timeout in milliseconds (default: 30000)
  --patterns <paths...>     File patterns to analyze (default: src)
  --verbose, -v             Enable verbose logging
  --no-exit-on-error        Don't exit with error code when diagnostics found
  --cwd <path>              Working directory (default: current directory)
  --help, -h                Show this help message

EXAMPLES:
  # Default (analyzes src/)
  omny diagnostics
  
  # ESLint only with custom patterns
  omny diagnostics --run eslint --patterns "src" "tests"
  
  # TypeScript with pass-through args
  omny diagnostics --run typescript -- --noEmit --strict
  
  # ESLint with options
  omny diagnostics --run eslint -- --fix --cache
  
  # Custom output
  omny diagnostics --run all --output ./reports --verbose

OUTPUT:
  Reports are written to .omnyreporter/{eslint,typescript}/errors/
  Each file with diagnostics gets a separate JSON file with structured error data.
`);
}

export async function runDiagnosticsCli(args: string[]): Promise<void> {
	const cliArgs = parseArgs(args);
	const config = buildReportingConfig(cliArgs);

	try {
		const orchestrator = new ReportingOrchestrator(config);
		const result = await orchestrator.execute();

		// Print results to console
		orchestrator.printResults(result);

		// Exit with appropriate code
		if (config.exitCodeOnError && !result.success) {
			process.exit(1);
		}
	} catch (error) {
		console.error('❌ Diagnostic reporting failed:', (error as Error).message);
		if (cliArgs.verbose === true) {
			console.error(error);
		}
		process.exit(2);
	}
}

function buildReportingConfig(cliArgs: CliArgs): ReportingConfig {
	const timeout = cliArgs.timeout ?? 30000;
	const patterns =
		cliArgs.patterns !== undefined && cliArgs.patterns.length > 0
			? cliArgs.patterns
			: ['src'];
	const verbose = cliArgs.verbose ?? false;
	const cwd = cliArgs.cwd ?? process.cwd();
	const exitCodeOnError = cliArgs.exitOnError ?? true;

	return {
		run: cliArgs.run,
		outputDir: cliArgs.output ?? '.omnyreporter',
		verbose,
		exitCodeOnError,
		cwd,
		eslintConfig: {
			timeout,
			patterns,
		},
		typescriptConfig: {
			timeout,
			patterns,
		},
	};
}
