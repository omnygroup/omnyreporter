/**
 * Validation services registration
 * @module di/registerValidation
 */

import { ConfigLoader } from '../domain/config/ConfigLoader.js';
import { ConfigValidator } from '../domain/validation/ConfigValidator.js';

import { TOKENS } from './tokens.js';

import type { Container } from 'inversify';

export function registerValidation(container: Container): void {
	container.bind(TOKENS.CONFIG_VALIDATOR).to(ConfigValidator).inSingletonScope();
	container.bind(TOKENS.CONFIG_LOADER).to(ConfigLoader).inSingletonScope();
}
