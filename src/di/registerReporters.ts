/**
 * Reporter services registration
 * @module di/registerReporters
 */


import { EslintReporter } from '../reporters/eslint/EslintReporter.js';
import { TypeScriptReporter } from '../reporters/typescript/TypeScriptReporter.js';
import { VitestAdapter } from '../reporters/vitest/VitestAdapter.js';

import { TOKENS } from './tokens.js';

import type { Container } from 'inversify';

export function registerReporters(container: Container): void {
  container
    .bind(TOKENS.ESLINT_REPORTER)
    .toDynamicValue(() => new EslintReporter(container.get(TOKENS.LOGGER)))
    .inTransientScope();

  container
    .bind(TOKENS.TYPESCRIPT_REPORTER)
    .toDynamicValue(() => new TypeScriptReporter(container.get(TOKENS.LOGGER)))
    .inTransientScope();

  container
    .bind(TOKENS.VITEST_ADAPTER)
    .toDynamicValue(() => new VitestAdapter(container.get(TOKENS.LOGGER)))
    .inTransientScope();
}
