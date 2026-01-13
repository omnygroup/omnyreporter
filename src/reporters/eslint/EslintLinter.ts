/**
 * ESLint Linter API wrapper
 */

import { ESLint } from 'eslint';

import type { Logger } from '../interfaces.js';

export interface LintResult {
	readonly filePath: string;
	readonly messages: LintMessage[];
	readonly errorCount: number;
	readonly warningCount: number;
}

export interface LintMessage {
	readonly line: number;
	readonly column: number;
	readonly severity: 1 | 2; // 1 = warning, 2 = error
	readonly message: string;
	readonly ruleId: string | null;
	readonly fix?: {
		readonly range: [number, number];
		readonly text: string;
	};
}

export interface EslintLinterAPI {
	/**
	 * Lint files matching patterns
	 */
	lint(filePatterns: string[]): Promise<LintResult[]>;

	/**
	 * Get ESLint version
	 */
	getVersion(): string;

	/**
	 * Check if ESLint is properly configured
	 */
	isConfigured(): Promise<boolean>;
}

export class EslintLinterImpl implements EslintLinterAPI {
	readonly #eslint: ESLint;
	readonly #logger: Logger;
	readonly #cwd: string;

	public constructor(cwd: string, logger: Logger, overrideConfigFile?: string) {
		this.#cwd = cwd;
		this.#logger = logger;
		
		const eslintOptions: ESLint.Options = {
			cwd,
			errorOnUnmatchedPattern: false,
		};

		if (overrideConfigFile !== undefined) {
			eslintOptions.overrideConfigFile = overrideConfigFile;
		}

		this.#eslint = new ESLint(eslintOptions);
	}

	public async lint(filePatterns: string[]): Promise<LintResult[]> {
		try {
			this.#logger.debug('Running ESLint', { filePatterns, cwd: this.#cwd });
			
			const results = await this.#eslint.lintFiles(filePatterns);
			
			return results.map(result => ({
				filePath: result.filePath,
				messages: result.messages.map(msg => ({
					line: msg.line,
					column: msg.column,
					severity: msg.severity,
					message: msg.message,
					ruleId: msg.ruleId,
				fix: msg.fix !== undefined ? {
						range: msg.fix.range,
						text: msg.fix.text,
					} : undefined,
				})),
				errorCount: result.errorCount,
				warningCount: result.warningCount,
			}));
		} catch (error: unknown) {
			let errorMsg: string;
			let errorStack: string;
			if (error instanceof Error) {
				errorMsg = error.message;
				errorStack = error.stack ?? '';
			} else {
				errorMsg = String(error);
				errorStack = '';
			}
			this.#logger.error('ESLint execution failed', { 
				error: errorMsg,
				stack: errorStack,
				filePatterns,
				cwd: this.#cwd,
			});
			throw new Error(`ESLint execution failed: ${errorMsg}`);
		}
	}

	public getVersion(): string {
		return ESLint.version;
	}

	public async isConfigured(): Promise<boolean> {
		try {
			// Try to calculate config for a test file
			await this.#eslint.calculateConfigForFile('test.js');
			return true;
		} catch {
			return false;
		}
	}
}
