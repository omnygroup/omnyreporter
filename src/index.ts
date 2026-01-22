/**
 * OmnyReporter - Unified diagnostic and test reporting
 *
 * @packageDocumentation
 */

import 'reflect-metadata';

// Core layer - types, contracts, abstractions, errors
export * from './core/index.js';

// Domain layer - business logic, analytics, validation
export * from './domain/index.js';

// Infrastructure layer - external services
export * from './infrastructure/index.js';

// Application layer - use-cases and orchestration
export * from './application/index.js';

// Reporters layer - tool adapters
export * from './reporters/index.js';

// View layer - CLI and presentation
// DONE: Fix yargs types and CLI integration (completed)
// export * from './view/index.js';
