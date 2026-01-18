/**
 * Analytics services registration
 * @module di/registerAnalytics
 */

import { DiagnosticAnalytics } from '../domain/analytics/diagnostics/DiagnosticAnalytics.js';

import { TOKENS } from './tokens.js';

import type { Container } from 'inversify';


export function registerAnalytics(container: Container): void {
  container.bind(TOKENS.DIAGNOSTIC_ANALYTICS).to(DiagnosticAnalytics).inTransientScope();
}
