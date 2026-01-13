/**
 * TypeScript diagnostic message formatter
 */

import ts from 'typescript';

export interface DiagnosticsMessageFormatter {
	/**
	 * Format diagnostic message text
	 */
	format(diagnostic: ts.Diagnostic): string;

	/**
	 * Extract error code from diagnostic
	 */
	extractCode(diagnostic: ts.Diagnostic): string;
}

export class TypeScriptMessageFormatterImpl implements DiagnosticsMessageFormatter {
	public format(diagnostic: ts.Diagnostic): string {
		if (typeof diagnostic.messageText === 'string') {
			return diagnostic.messageText;
		}

		return ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
	}

	public extractCode(diagnostic: ts.Diagnostic): string {
		return diagnostic.code > 0 ? `TS${String(diagnostic.code)}` : 'TS0000';
	}
}
