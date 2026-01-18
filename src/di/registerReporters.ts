/**
 * Reporter services registration
 * @module di/registerReporters
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { EslintAdapter } from '../reporters/eslint/EslintAdapter.js';
import { TypeScriptAdapter } from '../reporters/typescript/TypeScriptAdapter.js';
import { VitestAdapter } from '../reporters/vitest/VitestAdapter.js';
import { ReportingOrchestrator } from '../reporters/ReportingOrchestrator.js';
import { ReportingFacade } from '../reporters/ReportingFacade.js';

export function registerReporters(container: Container): void {
  container
    .bind(TOKENS.ESLINT_ADAPTER)
    .toDynamicValue(() => new EslintAdapter(container.get(TOKENS.LOGGER)))
    .inTransientScope();

  container
    .bind(TOKENS.TYPESCRIPT_ADAPTER)
    .toDynamicValue(() => new TypeScriptAdapter(container.get(TOKENS.LOGGER)))
    .inTransientScope();

  container
    .bind(TOKENS.VITEST_ADAPTER)
    .toDynamicValue(() => new VitestAdapter(container.get(TOKENS.LOGGER)))
    .inTransientScope();

  container.bind(TOKENS.REPORTING_ORCHESTRATOR).to(ReportingOrchestrator).inTransientScope();
  container.bind(TOKENS.REPORTING_FACADE).to(ReportingFacade).inSingletonScope();
  container.bind(ReportingFacade).to(ReportingFacade).inSingletonScope();
}
