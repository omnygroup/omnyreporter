/**
 * TypeScript diagnostics parser - converts ts.Diagnostic to Diagnostic format
 */

import ts from 'typescript';

import type { PathNormalizer, SecurityValidator } from '../interfaces.js';
import type { Diagnostic } from '../types.js';
import type { DiagnosticsMessageFormatter } from './TypeScriptMessageFormatter.js';

export interface DiagnosticsParser {
	/**
	 * Parse TypeScript diagnostics into standardized format
	 */
	parse(tsDiagnostics: ts.Diagnostic[]): Diagnostic[];
}

export class DiagnosticsParserImpl implements DiagnosticsParser {
	readonly #formatter: DiagnosticsMessageFormatter;
	readonly #pathNormalizer: PathNormalizer;
	readonly #securityValidator: SecurityValidator;
	readonly #sanitize: boolean;

	public constructor(
		formatter: DiagnosticsMessageFormatter,
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator,
		sanitize = true
	) {
		this.#formatter = formatter;
		this.#pathNormalizer = pathNormalizer;
		this.#securityValidator = securityValidator;
		this.#sanitize = sanitize;
	}

	public parse(tsDiagnostics: ts.Diagnostic[]): Diagnostic[] {
		const diagnostics: Diagnostic[] = [];

		for (const tsDiag of tsDiagnostics) {
			// Skip diagnostics without file information
			if (tsDiag.file === undefined || tsDiag.start === undefined) {
				continue;
			}

			const diagnostic = this.#convertDiagnostic(tsDiag);
			diagnostics.push(diagnostic);
		}

		return diagnostics;
	}

	#convertDiagnostic(tsDiag: ts.Diagnostic): Diagnostic {
		const file = tsDiag.file;
		const start = tsDiag.start;
		
		// Types are guaranteed by the parse() method guard clause
		if (file === undefined || start === undefined) {
			throw new Error('Invalid diagnostic: missing file or start position');
		}

		const { line, character } = file.getLineAndCharacterOfPosition(start);

		// Normalize file path
		const normalizedPath = this.#pathNormalizer.normalize(file.fileName);

		// Format and sanitize message
		const rawMessage = this.#formatter.format(tsDiag);
		const message = this.#sanitize
			? this.#securityValidator.sanitizeMessage(rawMessage)
			: rawMessage;

		// Extract code
		const code = this.#formatter.extractCode(tsDiag);

		// Determine severity
		const severity = this.#getSeverity(tsDiag.category);

		return {
			filePath: normalizedPath,
			line: line + 1, // TypeScript uses 0-based, we use 1-based
			column: character + 1,
			severity,
			ruleId: code,
			message,
			suggestion: undefined, // TypeScript doesn't provide automatic fixes in diagnostics
			source: 'typescript',
		};
	}

	#getSeverity(category: ts.DiagnosticCategory): 'error' | 'warning' {
		switch (category) {
			case ts.DiagnosticCategory.Error:
				return 'error';
			case ts.DiagnosticCategory.Warning:
				return 'warning';
			case ts.DiagnosticCategory.Suggestion:
			case ts.DiagnosticCategory.Message:
				return 'warning';
			default: {
				// Exhaustiveness check: if we reach here, a new category was added
				const _exhaustive: never = category;
				return _exhaustive;
			}
		}
	}
}
