/**
 * Path services registration
 * @module di/registerPaths
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { UpathService } from '../infrastructure/paths/UpathService.js';
import type { IPathService } from '../core/index.js';

export function registerPaths(container: Container): void {
  container.bind<IPathService>(TOKENS.PATH_SERVICE).to(UpathService).inSingletonScope();
}
