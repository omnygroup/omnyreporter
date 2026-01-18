/**
 * Validation services registration
 * @module di/registerValidation
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { ConfigValidator } from '../domain/validation/ConfigValidator.js';

export function registerValidation(container: Container): void {
  container.bind(TOKENS.CONFIG_VALIDATOR).to(ConfigValidator).inSingletonScope();
}
