/**
 * Aggregation services registration
 * @module di/registerAggregation
 */

import { DiagnosticAggregator } from '../domain/aggregation/DiagnosticAggregator.js';

import { TOKENS } from './tokens.js';

import type { IDiagnosticAggregator } from '../core/contracts/IDiagnosticAggregator.js';
import type { Container } from 'inversify';



export function registerAggregation(container: Container): void {
  container
    .bind<IDiagnosticAggregator>(TOKENS.DIAGNOSTIC_AGGREGATOR)
    .to(DiagnosticAggregator)
    .inSingletonScope();
}
