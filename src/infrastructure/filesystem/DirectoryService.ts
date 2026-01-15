/**
 * Directory management service
 * Handles .omnyreporter directory structure
 * @module infrastructure/filesystem/DirectoryService
 */

import { resolve } from 'node:path';

import { injectable } from 'inversify';

import type { IFileSystem } from '../../core/index.js';

const OMNY_DIR = '.omnyreporter';
const REPORTS_DIR = 'reports';
const TEMP_DIR = 'temp';

/**
 * Service for managing application directory structure
 */
@injectable()
export class DirectoryService {
  private readonly rootPath: string;

  public constructor(
    private readonly fileSystem: IFileSystem,
    rootPath: string = process.cwd()
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
}
