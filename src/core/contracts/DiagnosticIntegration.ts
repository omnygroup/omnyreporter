/**
 * Diagnostic integration contract
 * @module core/contracts/DiagnosticIntegration
 */

import type { CollectionConfig } from '../../domain/index.js';
import type { DiagnosticError } from '../errors/index.js';
import type { Diagnostic, IntegrationName, Result } from '../types/index.js';

export interface DiagnosticIntegration {
	collect(config: CollectionConfig): Promise<Result<readonly Diagnostic[], DiagnosticError>>;
	getName(): IntegrationName;
}
