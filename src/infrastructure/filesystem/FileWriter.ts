/**
 * Simple file writer implementation using fs-extra
 * @module infrastructure/filesystem/FileWriter
 */

import { resolve } from 'node:path';

import fs from 'fs-extra';
import { injectable } from 'inversify';

import { FileSystemError, ok, err ,type  IWriter,type  WriteOptions,type  WriteStats,type  Result } from '../../core/index.js';

/**
 * FileWriter - writes diagnostics (or arbitrary data) to a file
 * Uses fs-extra to perform safe writes and directory creation.
 */
@injectable()
export class FileWriter implements IWriter<unknown> {
  private readonly basePath: string;

  public constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Write data serialized as JSON to a file named 'diagnostics.json'
   * @param data Data to write
   * @param options Write options to control behaviour
   * @returns Result with WriteStats or FileSystemError
   */
  public async write(data: unknown, options: WriteOptions = {}): Promise<Result<WriteStats, FileSystemError>> {
    const filePath: string = resolve(this.basePath, 'diagnostics.json');
    const start: number = Date.now();

    try {
      if (options.ensureDir ?? true) {
        await fs.ensureDir(resolve(this.basePath));
      }

      const content: string = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, { encoding: 'utf8' });

      const bytes: number = Buffer.byteLength(content, 'utf8');
      const stats: WriteStats = {
        filesWritten: 1,
        bytesWritten: bytes,
        duration: Date.now() - start,
        timestamp: new Date(),
      };

      return ok(stats);
    } catch (error) {
      return err(
        error instanceof FileSystemError
          ? error
          : new FileSystemError('Failed to write file', {}, error as Error)
      );
    }
  }
}

