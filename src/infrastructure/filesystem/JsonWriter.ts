/**
 * JSON file writer
 * @module infrastructure/filesystem/JsonWriter
 */

import { injectable } from 'inversify';
import { resolve } from 'node:path';

import type { IFileSystem, IWriter, WriteStats, WriteOptions, Result } from '../../core/index.js';
import { FileSystemError, ok, err } from '../../core/index.js';

/**
 * Writer for JSON files
 */
@injectable()
export class JsonWriter implements IWriter<unknown> {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly basePath: string
  ) {}

  public async write(
    data: unknown,
    options: WriteOptions = {}
  ): Promise<Result<WriteStats, Error>> {
    try {
      const filePath = resolve(this.basePath, 'report.json');
      const stats = await this.fileSystem.writeJson(filePath, data, options);
      return ok(stats);
    } catch (error) {
      return err(
        error instanceof FileSystemError
          ? error
          : new FileSystemError('Failed to write JSON', {}, error as Error)
      );
    }
  }
}
