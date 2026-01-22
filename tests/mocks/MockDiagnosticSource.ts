/**
 * Mock implementation of IDiagnosticIntegration for testing
 * @module tests/mocks/MockDiagnosticIntegration
 */

import { ok, err } from 'neverthrow';

import type { IDiagnosticSource } from '../../src/core/contracts/index.js';
import type { Diagnostic, Result } from '../../src/core/types/index.js';
import type { CollectionConfig } from '../../src/domain/index.js';

export class MockDiagnosticIntegration implements IDiagnosticSource {
	private name: string;
	private diagnosticsToReturn: Diagnostic[] = [];
	private errorToThrow: Error | null = null;
	private callCount = 0;

	constructor(name = 'mock-integration') {
		this.name = name;
	}

	async collect(_config: CollectionConfig): Promise<Result<readonly Diagnostic[], Error>> {
		this.callCount++;
		await Promise.resolve();
		if (this.errorToThrow !== null) {
			return err(this.errorToThrow);
		}
		return ok(this.diagnosticsToReturn as readonly Diagnostic[]);
	}

	getName(): string {
		return this.name;
	}

	setDiagnostics(diagnostics: Diagnostic[]): void {
		this.diagnosticsToReturn = diagnostics;
	}

	setError(error: Error): void {
		this.errorToThrow = error;
	}

	clearError(): void {
		this.errorToThrow = null;
	}

	getCallCount(): number {
		return this.callCount;
	}

	resetCallCount(): void {
		this.callCount = 0;
	}
}
