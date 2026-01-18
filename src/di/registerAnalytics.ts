/**
 * Analytics services registration
 * @module di/registerAnalytics
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { DiagnosticAnalytics } from '../domain/analytics/diagnostics/DiagnosticAnalytics.js';
import { TypeScriptAnalytics } from '../domain/analytics/typescript/TypeScriptAnalytics.js';

export function registerAnalytics(container: Container): void {
  container.bind(TOKENS.DIAGNOSTIC_ANALYTICS).to(DiagnosticAnalytics).inTransientScope();
  container.bind(TOKENS.TYPESCRIPT_ANALYTICS).to(TypeScriptAnalytics).inTransientScope();
}
