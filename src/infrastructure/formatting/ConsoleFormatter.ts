/**
 * Console formatter with colors and styling
 * @module infrastructure/formatting/ConsoleFormatter
 */

import chalk from 'chalk';
import { injectable } from 'inversify';
import createSpinner from 'ora';

import { type Diagnostic ,type  DiagnosticStatistics ,type  IFormatter } from '../../core/index.js';

/**
 * Console formatter for diagnostics with colors and styling
 */
@injectable()
export class ConsoleFormatter implements IFormatter<Diagnostic> {
  public format(diagnostic: Diagnostic): string {
    const severity = this.formatSeverity(diagnostic.severity);
    const code = chalk.gray(`[${diagnostic.code}]`);
    const location = chalk.cyan(`${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column}`);
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
    lines.push(chalk.red(`  ✖ Errors: ${stats.errorCount}`));
    lines.push(chalk.yellow(`  ⚠ Warnings: ${stats.warningCount}`));
    lines.push(chalk.blue(`  ℹ Info: ${stats.infoCount}`));
    lines.push(chalk.gray(`  ○ Notes: ${stats.noteCount}`));
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

/**
 * Progress spinner helper
 */
export class ProgressSpinner {
  private spinner: ReturnType<typeof createSpinner> | null = null;

  public start(text: string): void {
    this.spinner = createSpinner(chalk.cyan(text)).start();
  }

  public succeed(text?: string): void {
    if (this.spinner) {
      this.spinner.succeed(text ? chalk.green(text) : undefined);
      this.spinner = null;
    }
  }

  public fail(text?: string): void {
    if (this.spinner) {
      this.spinner.fail(text ? chalk.red(text) : undefined);
      this.spinner = null;
    }
  }

  public warn(text?: string): void {
    if (this.spinner) {
      this.spinner.warn(text ? chalk.yellow(text) : undefined);
      this.spinner = null;
    }
  }

  public stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}
