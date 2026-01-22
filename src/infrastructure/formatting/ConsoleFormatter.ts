/**
 * Console formatter with colors and styling
 * @module infrastructure/formatting/ConsoleFormatter
 */

import chalk from 'chalk';
import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import { type Diagnostic, type DiagnosticStatistics, type IFormatter, type ISanitizer } from '@core';

/**
 * Console formatter for diagnostics with colors and styling
 * Sanitizes file paths in output
 */
@injectable()
export class ConsoleFormatter implements IFormatter<Diagnostic> {
	public constructor(
		@inject(TOKENS.SANITIZER) private readonly sanitizer: ISanitizer
	) {}

	public format(diagnostic: Diagnostic): string {
		const severity = this.formatSeverity(diagnostic.severity);
		const code = chalk.gray(`[${diagnostic.code}]`);
		const sanitizedPath = this.sanitizer.sanitizePath(diagnostic.filePath);
		const location = chalk.cyan(`${sanitizedPath}:${String(diagnostic.line)}:${String(diagnostic.column)}`);
		const message = diagnostic.message;

		return `${severity} ${location} ${code} ${message}`;
	}

	/**
	 * Format diagnostics summary with statistics
	 * @param diagnostics Diagnostics to format
	 * @param stats Statistics snapshot
	 * @returns Formatted summary
	 */
	public formatSummary(diagnostics: readonly Diagnostic[], stats: DiagnosticStatistics): string {
		const lines: string[] = [];

		lines.push('');
		lines.push(chalk.bold('═══ Diagnostic Report ═══'));
		lines.push('');

		diagnostics.forEach((d) => {
			lines.push(this.format(d));
		});

		lines.push('');
		lines.push(chalk.bold('─── Summary ───'));
		lines.push(chalk.red(`  ✖ Errors: ${String(stats.errorCount)}`));
		lines.push(chalk.yellow(`  ⚠ Warnings: ${String(stats.warningCount)}`));
		lines.push(chalk.blue(`  ℹ Info: ${String(stats.infoCount)}`));
		lines.push(chalk.gray(`  ○ Notes: ${String(stats.noteCount)}`));
		lines.push('');

		return lines.join('\n');
	}

	private formatSeverity(severity: string): string {
		switch (severity) {
			case 'error':
				return chalk.red('✖ ERROR');
			case 'warning':
				return chalk.yellow('⚠ WARN');
			case 'info':
				return chalk.blue('ℹ INFO');
			case 'note':
				return chalk.gray('○ NOTE');
			default:
				return chalk.gray('? UNKNOWN');
		}
	}
}
