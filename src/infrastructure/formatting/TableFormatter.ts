/**
 * Table formatter using cli-table3
 * @module infrastructure/formatting/TableFormatter
 */

import { injectable } from 'inversify';
import Table from 'cli-table3';
import chalk from 'chalk';

import type { Diagnostic } from '../../core/index.js';
import type { IFormatter } from '../../core/index.js';

/**
 * Table formatter for diagnostics
 */
@injectable()
export class TableFormatter implements IFormatter<readonly Diagnostic[], string> {
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

      table.push([
        chalk.cyan(d.filePath),
        chalk.gray(`${d.line}:${d.column}`),
        severityColor(d.severity.toUpperCase()),
        chalk.magenta(d.code),
        d.message.substring(0, 40),
      ]);
    });

    return table.toString();
  }
}
