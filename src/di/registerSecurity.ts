/**
 * Security services registration
 * @module di/registerSecurity
 */


import { PathValidator } from '../infrastructure/security/PathValidator.js';
import { RedactSanitizer } from '../infrastructure/security/RedactSanitizer.js';

import { TOKENS } from './tokens.js';

import type { ISanitizer } from '../core/index.js';
import type { Container } from 'inversify';

export function registerSecurity(container: Container): void {
  container.bind<ISanitizer>(TOKENS.SANITIZER).to(RedactSanitizer).inSingletonScope();
  container.bind(TOKENS.PATH_VALIDATOR).to(PathValidator).inSingletonScope();
}
