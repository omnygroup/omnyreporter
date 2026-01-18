/**
 * Application layer services registration
 * Registers use-cases and application services
 * @module di/registerApplication
 */


import { DiagnosticApplicationService } from '../application/services/DiagnosticApplicationService.js';
import { GenerateReportUseCase } from '../application/usecases/GenerateReport.js';

import { TOKENS } from './tokens.js';

import type { IDiagnosticSource } from '../core/contracts/IDiagnosticSource.js';
import type { Container } from 'inversify';

export function registerApplication(container: Container): void {
  // Bind GenerateReportUseCase with factory (needs multiple sources as array)
  container
    .bind(TOKENS.GENERATE_REPORT_USE_CASE)
    .toDynamicValue(() => {
      const sources: IDiagnosticSource[] = [
        container.get(TOKENS.ESLINT_REPORTER),
        container.get(TOKENS.TYPESCRIPT_REPORTER),
      ];
      return new GenerateReportUseCase(
        sources,
        container.get(TOKENS.DIAGNOSTIC_AGGREGATOR),
        container.get(TOKENS.DIAGNOSTIC_ANALYTICS)
      );
    })
    .inTransientScope();

  // Bind DiagnosticApplicationService
  // Uses @inject decorators in constructor, so use .to()
  container
    .bind(TOKENS.DIAGNOSTIC_APPLICATION_SERVICE)
    .to(DiagnosticApplicationService)
    .inSingletonScope();
}
