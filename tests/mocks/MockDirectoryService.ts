/**
 * Mock implementation of DirectoryService
 * @module tests/mocks/MockDirectoryService
 */

import type { IntegrationName } from '../../src/core/types';

/**
 * Mock DirectoryService for testing
 */
export class MockDirectoryService {
	private clearedErrors: IntegrationName[] = [];
	private clearedAll = false;

	public async ensureDirectories(): Promise<void> {
		// Mock implementation
		await Promise.resolve();
	}

	public async cleanupTemp(): Promise<void> {
		// Mock implementation
		await Promise.resolve();
	}

	public getAppDirectory(): string {
		return '.omnyreporter';
	}

	public getReportsDirectory(): string {
		return '.omnyreporter/reports';
	}

	public getTempDirectory(): string {
		return '.omnyreporter/temp';
	}

	public getInstrumentDirectory(integration: IntegrationName): string {
		return `.omnyreporter/${integration}`;
	}

	public getInstrumentErrorsDirectory(integration: IntegrationName): string {
		return `.omnyreporter/${integration}/errors`;
	}

	public async clearInstrumentErrors(integration: IntegrationName): Promise<void> {
		await Promise.resolve();
		this.clearedErrors.push(integration);
	}

	public async clearAllErrors(): Promise<void> {
		await Promise.resolve();
		this.clearedAll = true;
		this.clearedErrors = ['eslint', 'typescript', 'vitest'];
	}

	public wasClearedAll(): boolean {
		return this.clearedAll;
	}

	public getClearedErrors(): IntegrationName[] {
		return [...this.clearedErrors];
	}

	public reset(): void {
		this.clearedErrors = [];
		this.clearedAll = false;
	}
}
