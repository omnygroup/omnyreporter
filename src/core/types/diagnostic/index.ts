/**
 * Backward compatibility barrel export
 * This file re-exports types that have been split into separate files
 */

export type {
  Diagnostic,
} from './Diagnostic.js';

export type {
  DiagnosticReport,
  DiagnosticReportMetadata,
} from './DiagnosticReport.js';

export type {
  DiagnosticFileReport,
} from './DiagnosticFileReport.js';

export type {
  DiagnosticSeverity,
} from './DiagnosticSeverity.js';

export type {
  DiagnosticIntegration,
} from './DiagnosticIntegration.js';

export { createDiagnostic } from './createDiagnostic.js';

