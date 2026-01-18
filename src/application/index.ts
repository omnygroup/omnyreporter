/**
 * Application layer barrel export
 * Coordinates between layers with use-cases and services
 * @module application
 */

export { GenerateReportUseCase, type ReportResult } from './usecases/index.js';
export {
  DiagnosticApplicationService,
  type DiagnosticReportingResult,
} from './services/index.js';
