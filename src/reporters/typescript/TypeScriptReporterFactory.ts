/**
 * Factory for creating TypeScript reporter instances
 */

import { LoggerImpl } from '../shared/Logger.js';
import { PathNormalizerImpl } from '../shared/PathNormalizer.js';
import { SecurityValidatorImpl } from '../shared/SecurityValidator.js';

import { DiagnosticsParserImpl } from './DiagnosticsParser.js';
import { TscStreamProcessorImpl } from './TscStreamProcessor.js';
import { TypeScriptCompilerImpl } from './TypeScriptCompiler.js';
import { TypeScriptMessageFormatterImpl } from './TypeScriptMessageFormatter.js';
import { TypeScriptReporter } from './TypeScriptReporter.js';

import type { Logger, PathNormalizer, SecurityValidator } from '../interfaces.js';
import type { TypeScriptConfig } from './types.js';

/**
 * Create a new TypeScript reporter instance with all dependencies
 */
function createTypeScriptReporter(config: TypeScriptConfig): TypeScriptReporter {
	// Create shared dependencies
	const logger = new LoggerImpl();
	const pathNormalizer = new PathNormalizerImpl(config.cwd);
	const securityValidator = new SecurityValidatorImpl(config.cwd, config.securityPolicy);

	// Create TypeScript-specific dependencies
	const compiler = new TypeScriptCompilerImpl(config.cwd, logger);
	const formatter = new TypeScriptMessageFormatterImpl();
	const parser = new DiagnosticsParserImpl(
		formatter,
		pathNormalizer,
		securityValidator,
		config.sanitize
	);
	const streamProcessor = new TscStreamProcessorImpl(parser, logger);

	// Create reporter
	return new TypeScriptReporter(
		logger,
		pathNormalizer,
		securityValidator,
		compiler,
		streamProcessor
	);
}

/**
 * Create with custom dependencies (for testing)
 */
function createTypeScriptReporterWithDependencies(
	config: TypeScriptConfig,
	logger: Logger,
	pathNormalizer: PathNormalizer,
	securityValidator: SecurityValidator
): TypeScriptReporter {
	const compiler = new TypeScriptCompilerImpl(config.cwd, logger);
	const formatter = new TypeScriptMessageFormatterImpl();
	const parser = new DiagnosticsParserImpl(
		formatter,
		pathNormalizer,
		securityValidator,
		config.sanitize
	);
	const streamProcessor = new TscStreamProcessorImpl(parser, logger);

	return new TypeScriptReporter(
		logger,
		pathNormalizer,
		securityValidator,
		compiler,
		streamProcessor
	);
}

/**
 * Factory object for creating TypeScript reporter instances
 */
export const TypeScriptReporterFactory = {
	create: createTypeScriptReporter,
	createWithDependencies: createTypeScriptReporterWithDependencies,
} as const;
