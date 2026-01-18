/**
 * Logging services registration
 * @module di/registerLogging
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { ConsoleLogger } from '../infrastructure/logging/ConsoleLogger.js';
import { PinoLogger } from '../infrastructure/logging/PinoLogger.js';
import type { ILogger } from '../core/index.js';

export function registerLogging(container: Container): void {
  container
    .bind<ILogger>(TOKENS.LOGGER)
    .toDynamicValue(() => new PinoLogger())
    .inSingletonScope();

  container.bind<ILogger>(TOKENS.CONSOLE_LOGGER).to(ConsoleLogger).inSingletonScope();
}
