/**
 * Table formatter using cli-table3
 * @module infrastructure/formatting/TableFormatter
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import { type Diagnostic, type IFormatter, type ISanitizer } from '@core';

/**
 * Table formatter for diagnostics
 * Sanitizes file paths in output
 */
@injectable()
export class TableFormatter implements IFormatter<readonly Diagnostic[]> {
	public constructor(
		@inject(TOKENS.SANITIZER) private readonly sanitizer: ISanitizer
	) {}

	public format(diagnostics: readonly Diagnostic[]): string {
		const table = new Table({
			head: [
				chalk.bold('File'),
				chalk.bold('Line:Col'),
				chalk.bold('Severity'),
				chalk.bold('Code'),
				chalk.bold('Message'),
			],
			style: { head: [], border: ['cyan'] },
			wordWrap: true,
			colWidths: [30, 12, 10, 15, 40],
		});

		diagnostics.forEach((d) => {
			const severityColor =
				d.severity === 'error'
					? chalk.red
					: d.severity === 'warning'
						? chalk.yellow
						: d.severity === 'info'
							? chalk.blue
							: chalk.gray;

			const sanitizedPath = this.sanitizer.sanitizePath(d.filePath);

			table.push([
				chalk.cyan(sanitizedPath),
				chalk.gray(`${String(d.line)}:${String(d.column)}`),
				severityColor(d.severity.toUpperCase()),
				chalk.magenta(d.code),
				d.message.substring(0, 40),
			]);
		});

		return table.toString();
	}
}
