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

  public getInstrumentDirectory(source: IntegrationName): string {
    return `.omnyreporter/${source}`;
  }

  public getInstrumentErrorsDirectory(source: IntegrationName): string {
    return `.omnyreporter/${source}/errors`;
  }

  public async clearInstrumentErrors(source: IntegrationName): Promise<void> {
    await Promise.resolve();
    this.clearedErrors.push(source);
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
