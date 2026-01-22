/**
 * Application layer services registration
 * Registers use-cases and application services
 * @module di/registerApplication
 */


import { DiagnosticApplicationService } from '../application/DiagnosticApplicationService.js';
import { GenerateReportUseCase } from '../application/GenerateReportUseCase.js';

import { TOKENS } from './tokens.js';

import type { Container } from 'inversify';

export function registerApplication(container: Container): void {
  container.bind(TOKENS.GENERATE_REPORT_USE_CASE).to(GenerateReportUseCase).inTransientScope();
  container.bind(TOKENS.DIAGNOSTIC_APPLICATION_SERVICE).to(DiagnosticApplicationService).inSingletonScope();
}
