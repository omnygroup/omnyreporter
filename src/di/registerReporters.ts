/**
 * Reporter services registration
 * @module di/registerReporters
 */


import { EslintReporter } from '../reporters/eslint/EslintReporter.js';
import { TypeScriptReporter } from '../reporters/typescript/TypeScriptReporter.js';
import { VitestAdapter } from '../reporters/vitest/VitestAdapter.js';

import { TOKENS } from './tokens.js';

import type { DiagnosticIntegration } from '../core/contracts/DiagnosticIntegration.js';
import type { Container } from 'inversify';

export function registerReporters(container: Container): void {
  // Bind individual reporters
  container.bind(TOKENS.ESLINT_REPORTER).to(EslintReporter).inTransientScope();
  container.bind(TOKENS.TYPESCRIPT_REPORTER).to(TypeScriptReporter).inTransientScope();
  container.bind(TOKENS.VITEST_ADAPTER).to(VitestAdapter).inTransientScope();

  // Bind as DiagnosticIntegration for multi-inject
  container.bind<DiagnosticIntegration>(TOKENS.DIAGNOSTIC_INTEGRATION).to(EslintReporter).inTransientScope();
  container.bind<DiagnosticIntegration>(TOKENS.DIAGNOSTIC_INTEGRATION).to(TypeScriptReporter).inTransientScope();
}
