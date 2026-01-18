/**
 * Aggregation services registration
 * @module di/registerAggregation
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { DiagnosticAggregator } from '../domain/aggregation/DiagnosticAggregator.js';

export function registerAggregation(container: Container): void {
  container.bind(TOKENS.DIAGNOSTIC_AGGREGATOR).to(DiagnosticAggregator).inSingletonScope();
}
