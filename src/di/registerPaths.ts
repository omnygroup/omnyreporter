/**
 * Path services registration
 * @module di/registerPaths
 */


import { UpathService } from '../infrastructure/paths/UpathService.js';

import { TOKENS } from './tokens.js';

import type { IPathService } from '../core/index.js';
import type { Container } from 'inversify';

export function registerPaths(container: Container): void {
  container.bind<IPathService>(TOKENS.PATH_SERVICE).to(UpathService).inSingletonScope();
}
