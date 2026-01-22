/**
 * Logging services registration
 * @module di/registerLogging
 */


import { ConsoleLogger } from '../infrastructure/logging/ConsoleLogger.js';
import { PinoLogger } from '../infrastructure/logging/PinoLogger.js';

import { TOKENS } from './tokens.js';

import type { ILogger } from '../core/index.js';
import type { Container } from 'inversify';

export function registerLogging(container: Container): void {
  container.bind<ILogger>(TOKENS.LOGGER).to(PinoLogger).inSingletonScope();
  container.bind<ILogger>(TOKENS.CONSOLE_LOGGER).to(ConsoleLogger).inSingletonScope();
}
