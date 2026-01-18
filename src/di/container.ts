/**
 * Dependency injection container setup using inversify
 * @module di/container
 */

import 'reflect-metadata';
import { Container } from 'inversify';

import { registerAggregation } from './registerAggregation.js';
import { registerAnalytics } from './registerAnalytics.js';
import { registerApplication } from './registerApplication.js';
import { registerFilesystem } from './registerFilesystem.js';
import { registerFormatting } from './registerFormatting.js';
import { registerLogging } from './registerLogging.js';
import { registerPaths } from './registerPaths.js';
import { registerReporters } from './registerReporters.js';
import { registerSecurity } from './registerSecurity.js';
import { registerValidation } from './registerValidation.js';
import { TOKENS } from './tokens.js';

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
  registerApplication(container);

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
