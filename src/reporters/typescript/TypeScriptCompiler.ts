/**
 * TypeScript Compiler API wrapper
 */

import path from 'node:path';

import ts from 'typescript';

import type { Logger } from '../interfaces.js';

export interface TypeScriptCompilerAPI {
	/**
	 * Get all TypeScript diagnostics including strict mode checks
	 */
	getDiagnostics(tsconfigPath?: string): Promise<ts.Diagnostic[]>;

	/**
	 * Get TypeScript version
	 */
	getVersion(): string;

	/**
	 * Check if TypeScript is configured
	 */
	isConfigured(): boolean;
}

export class TypeScriptCompilerImpl implements TypeScriptCompilerAPI {
	readonly #cwd: string;
	readonly #logger: Logger;
	#program?: ts.Program;

	public constructor(cwd: string, logger: Logger) {
		this.#cwd = cwd;
		this.#logger = logger;
	}

	public async getDiagnostics(tsconfigPath?: string): Promise<ts.Diagnostic[]> {
		try {
			this.#logger.debug('Starting TypeScript diagnostics collection');

			const configPath = this.#findConfigFile(tsconfigPath);
			if (configPath === undefined) {
				throw new Error('tsconfig.json not found in project root');
			}

			this.#logger.debug('Using TypeScript config', { path: configPath });

			const configFile = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));
			if (configFile.error !== undefined) {
				throw new Error(
					'Failed to read tsconfig.json: ' +
					ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')
				);
			}

			const parsedConfig = ts.parseJsonConfigFileContent(
				configFile.config,
				ts.sys,
				path.dirname(configPath)
			);

			if (parsedConfig.errors.length > 0) {
				const errorMessages = parsedConfig.errors
					.map((err) => ts.flattenDiagnosticMessageText(err.messageText, '\n'))
					.join('\n');
				throw new Error('Failed to parse tsconfig.json: ' + errorMessages);
			}

			this.#logger.debug('Creating TypeScript program', {
				fileCount: parsedConfig.fileNames.length,
			});

			// Ensure strict mode is enabled for comprehensive diagnostics
			const compilerOptions = {
				...parsedConfig.options,
				strict: true, // Enable strict mode to catch all issues
				noEmit: true, // Don't emit files
			};

			this.#program = ts.createProgram({
				rootNames: parsedConfig.fileNames,
				options: compilerOptions,
			});

			// Collect ALL diagnostics
			const allDiagnostics: ts.Diagnostic[] = [];

			// 1. Pre-emit diagnostics (syntax, type errors, etc.)
			allDiagnostics.push(...ts.getPreEmitDiagnostics(this.#program));

			// 2. Semantic diagnostics
			for (const sourceFile of this.#program.getSourceFiles()) {
				if (!sourceFile.isDeclarationFile) {
					allDiagnostics.push(...this.#program.getSemanticDiagnostics(sourceFile));
				}
			}

			// Remove duplicates
			const uniqueDiagnostics = Array.from(
				new Map(
					allDiagnostics.map(d => {
						const fileName = d.file?.fileName ?? 'unknown';
						const start = String(d.start ?? -1);
						const messageText = typeof d.messageText === 'string'
							? d.messageText
							: 'messageChain';
						return [
							`${fileName}-${start}-${messageText}`,
							d,
						];
					})
				).values()
			);

			this.#logger.debug('TypeScript diagnostics collected', {
				count: uniqueDiagnostics.length,
			});

			return await Promise.resolve(uniqueDiagnostics);
		} catch (error) {
			this.#logger.error('TypeScript diagnostics collection failed', { error });
			throw error;
		}
	}

	public getVersion(): string {
		return ts.version;
	}

	public isConfigured(): boolean {
		try {
			const configPath = this.#findConfigFile();
			return configPath !== undefined;
		} catch {
			return false;
		}
	}

	#findConfigFile(customPath?: string): string | undefined {
		if (customPath !== undefined && customPath.length > 0) {
			return path.resolve(this.#cwd, customPath);
		}

		return ts.findConfigFile(
			this.#cwd,
			(fileName) => ts.sys.fileExists(fileName),
			'tsconfig.json'
		);
	}

	public getProgram(): ts.Program | undefined {
		return this.#program;
	}
}
