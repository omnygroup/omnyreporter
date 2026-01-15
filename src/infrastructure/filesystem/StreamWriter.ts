/**
 * Stream writer for async iterables
 * @module infrastructure/filesystem/StreamWriter
 */

import { resolve } from 'node:path';

import { injectable } from 'inversify';

import { FileSystemError, ok, err ,type  IFileSystem,type  IWriter,type  WriteStats,type  WriteOptions,type  Result } from '../../core/index.js';

/**
 * Writer for streaming data (async iterables)
 * Collects data from stream and writes as JSON array
 */
@injectable()
export class StreamWriter<T> implements IWriter<AsyncIterable<T>> {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly basePath: string
  ) {}

  public async write(
    data: AsyncIterable<T>,
    options: WriteOptions = {}
  ): Promise<Result<WriteStats, Error>> {
    try {
      const items: T[] = [];

      for await (const item of data) {
        items.push(item);
      }

      const filePath = resolve(this.basePath, 'stream-report.json');
      const stats = await this.fileSystem.writeJson(filePath, items, options);

      return ok(stats);
    } catch (error) {
      return err(
        error instanceof FileSystemError
          ? error
          : new FileSystemError('Failed to write stream', {}, error as Error)
      );
    }
  }
}
