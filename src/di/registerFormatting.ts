/**
 * Formatting services registration
 * @module di/registerFormatting
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { ConsoleFormatter } from '../infrastructure/formatting/ConsoleFormatter.js';
import { JsonFormatter } from '../infrastructure/formatting/JsonFormatter.js';
import { TableFormatter } from '../infrastructure/formatting/TableFormatter.js';

export function registerFormatting(container: Container): void {
  container.bind(TOKENS.CONSOLE_FORMATTER).to(ConsoleFormatter).inTransientScope();
  container.bind(TOKENS.JSON_FORMATTER).to(JsonFormatter).inTransientScope();
  container.bind(TOKENS.TABLE_FORMATTER).to(TableFormatter).inTransientScope();
}
