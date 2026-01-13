/**
 * ESLint message parser - converts ESLint messages to Diagnostic format
 */

import type { PathNormalizer, SecurityValidator } from '../interfaces.js';
import type { Diagnostic } from '../types.js';
import type { LintMessage, LintResult } from './EslintLinter.js';

export interface LintMessageParser {
	/**
	 * Parse lint results into diagnostics
	 */
	parse(lintResults: LintResult[]): Diagnostic[];
}

export class LintMessageParserImpl implements LintMessageParser {
	readonly #pathNormalizer: PathNormalizer;
	readonly #securityValidator: SecurityValidator;
	readonly #sanitize: boolean;

	public constructor(
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator,
		sanitize = true
	) {
		this.#pathNormalizer = pathNormalizer;
		this.#securityValidator = securityValidator;
		this.#sanitize = sanitize;
	}

	public parse(lintResults: LintResult[]): Diagnostic[] {
		const diagnostics: Diagnostic[] = [];

		for (const result of lintResults) {
			const normalizedPath = this.#pathNormalizer.normalize(result.filePath);

			for (const message of result.messages) {
				diagnostics.push(this.#convertMessage(normalizedPath, message));
			}
		}

		return diagnostics;
	}

	#convertMessage(filePath: string, message: LintMessage): Diagnostic {
		const rawMessage = message.message;
		const sanitizedMessage = this.#sanitize
			? this.#securityValidator.sanitizeMessage(rawMessage)
			: rawMessage;

		return {
			filePath,
			line: message.line,
			column: message.column,
			severity: message.severity === 2 ? 'error' : 'warning',
			ruleId: message.ruleId ?? undefined,
			message: sanitizedMessage,
			suggestion: message.fix !== undefined ? this.#formatFix(message.fix) : undefined,
			source: 'eslint',
		};
	}

	#formatFix(fix: { readonly range: [number, number]; readonly text: string }): string {
		return `Replace characters ${String(fix.range[0])}-${String(fix.range[1])} with: ${fix.text}`;
	}
}
