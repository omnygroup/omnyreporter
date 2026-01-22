/**
 * Simple file writer implementation using fs-extra
 * @module infrastructure/filesystem/FileWriter
 */

import { resolve } from 'node:path';

import fs from 'fs-extra';
import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';

import { FileSystemError, ok, err ,type  IWriter,type  WriteOptions,type  WriteStats,type  Result } from '../../core/index.js';

/**
 * FileWriter - writes diagnostics (or arbitrary data) to a file
 * Uses fs-extra to perform safe writes and directory creation.
 */
@injectable()
export class FileWriter implements IWriter<unknown> {
  public constructor(
    @inject(TOKENS.BASE_PATH) private readonly basePath: string
  ) {}

  /**
   * Write data serialized as JSON to a file
   * @param data Data to write
   * @param options Write options including required fileName
   * @returns Result with WriteStats or FileSystemError
   */
  public async write(data: unknown, options: WriteOptions): Promise<Result<WriteStats, FileSystemError>> {
    const filePath: string = resolve(this.basePath, options.fileName);
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

