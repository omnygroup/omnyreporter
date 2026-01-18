/**
 * Dependency injection container setup using inversify
 * @module di/container
 */

import 'reflect-metadata';
import { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { registerLogging } from './registerLogging.js';
import { registerFilesystem } from './registerFilesystem.js';
import { registerPaths } from './registerPaths.js';
import { registerSecurity } from './registerSecurity.js';
import { registerFormatting } from './registerFormatting.js';
import { registerAnalytics } from './registerAnalytics.js';
import { registerAggregation } from './registerAggregation.js';
import { registerValidation } from './registerValidation.js';
import { registerReporters } from './registerReporters.js';

let containerInstance: Container | null = null;

/**
 * Setup the dependency injection container
 * @returns Configured inversify container
 */
export function setupContainer(): Container {
  const container = new Container({ defaultScope: 'Singleton' });

  // Register all services
  registerLogging(container);
  registerPaths(container);
  registerSecurity(container);
  registerFilesystem(container);
  registerFormatting(container);
  registerAggregation(container);
  registerAnalytics(container);
  registerValidation(container);
  registerReporters(container);

  return container;
}

/**
 * Get or create the global container instance
 * @returns Global inversify container
 */
export function getContainer(): Container {
  containerInstance ??= setupContainer();
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetContainer(): void {
  containerInstance = null;
}

export { TOKENS };
