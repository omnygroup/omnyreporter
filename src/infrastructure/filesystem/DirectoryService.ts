/**
 * Directory management service
 * Handles .omnyreporter directory structure
 * @module infrastructure/filesystem/DirectoryService
 */

import { resolve } from 'node:path';

import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';

import { type IFileSystem, IntegrationName } from '../../core/index.js';

const OMNY_DIR = '.omnyreporter';
const REPORTS_DIR = 'reports';
const TEMP_DIR = 'temp';
const ERRORS_DIR = 'errors';

/**
 * Service for managing application directory structure
 */
@injectable()
export class DirectoryService {
  private readonly rootPath: string;

  public constructor(
    @inject(TOKENS.FILE_SYSTEM) private readonly fileSystem: IFileSystem,
    @inject(TOKENS.BASE_PATH) rootPath: string
  ) {
    this.rootPath = fileSystem.resolvePath(rootPath);
  }

  /**
   * Get application data directory
   * @returns Path to .omnyreporter directory
   */
  public getAppDirectory(): string {
    return resolve(this.rootPath, OMNY_DIR);
  }

  /**
   * Get reports directory
   * @returns Path to .omnyreporter/reports directory
   */
  public getReportsDirectory(): string {
    return resolve(this.getAppDirectory(), REPORTS_DIR);
  }

  /**
   * Get temporary directory
   * @returns Path to .omnyreporter/temp directory
   */
  public getTempDirectory(): string {
    return resolve(this.getAppDirectory(), TEMP_DIR);
  }

  /**
   * Ensure all required directories exist
   */
  public async ensureDirectories(): Promise<void> {
    await this.fileSystem.ensureDir(this.getAppDirectory());
    await this.fileSystem.ensureDir(this.getReportsDirectory());
    await this.fileSystem.ensureDir(this.getTempDirectory());
  }

  /**
   * Clean up temporary directory
   */
  public async cleanupTemp(): Promise<void> {
    const tempDir = this.getTempDirectory();
    if (await this.fileSystem.exists(tempDir)) {
      await this.fileSystem.removeDir(tempDir);
      await this.fileSystem.ensureDir(tempDir);
    }
  }

  /**
   * Get instrument-specific directory
   * @param source Diagnostic source (eslint, typescript, vitest)
   * @returns Path to .omnyreporter/{source} directory
   */
  public getInstrumentDirectory(source: IntegrationName): string {
    return resolve(this.getAppDirectory(), source);
  }

  /**
   * Get errors directory for specific instrument
   * @param source Diagnostic source
   * @returns Path to .omnyreporter/{source}/errors directory
   */
  public getInstrumentErrorsDirectory(source: IntegrationName): string {
    return resolve(this.getInstrumentDirectory(source), ERRORS_DIR);
  }

  /**
   * Clear errors for specific instrument
   * @param source Diagnostic source
   */
  public async clearInstrumentErrors(source: IntegrationName): Promise<void> {
    const errorsDir = this.getInstrumentErrorsDirectory(source);
    if (await this.fileSystem.exists(errorsDir)) {
      await this.fileSystem.removeDir(errorsDir);
    }
  }

  /**
   * Clear all diagnostic errors
   */
  public async clearAllErrors(): Promise<void> {
    const sources: IntegrationName[] = [IntegrationName.ESLint, IntegrationName.TypeScript, IntegrationName.Vitest];

    for (const source of sources) {
      await this.clearInstrumentErrors(source);
    }
  }
}
