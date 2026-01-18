/**
 * Validation services registration
 * @module di/registerValidation
 */

import { ConfigValidator } from '../domain/validation/ConfigValidator.js';

import { TOKENS } from './tokens.js';

import type { Container } from 'inversify';


export function registerValidation(container: Container): void {
  container.bind(TOKENS.CONFIG_VALIDATOR).to(ConfigValidator).inSingletonScope();
}
