/**
 * Security services registration
 * @module di/registerSecurity
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { RedactSanitizer } from '../infrastructure/security/RedactSanitizer.js';
import { PathValidator } from '../infrastructure/security/PathValidator.js';
import type { ISanitizer } from '../core/index.js';

export function registerSecurity(container: Container): void {
  container.bind<ISanitizer>(TOKENS.SANITIZER).to(RedactSanitizer).inSingletonScope();

  container
    .bind(TOKENS.PATH_VALIDATOR)
    .toDynamicValue(() => new PathValidator(container.get(TOKENS.PATH_SERVICE)))
    .inSingletonScope();
}
