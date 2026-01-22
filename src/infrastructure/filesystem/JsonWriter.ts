/**
 * JSON file writer
 * @module infrastructure/filesystem/JsonWriter
 */

import { resolve } from 'node:path';

import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';

import {
	FileSystemError,
	ok,
	err,
	type IFileSystem,
	type IWriter,
	type WriteStats,
	type WriteOptions,
	type Result,
} from '../../core/index.js';

/**
 * Writer for JSON files
 */
@injectable()
export class JsonWriter implements IWriter<unknown> {
	public constructor(
		@inject(TOKENS.FILE_SYSTEM) private readonly fileSystem: IFileSystem,
		@inject(TOKENS.BASE_PATH) private readonly basePath: string
	) {}

	public async write(data: unknown, options: WriteOptions): Promise<Result<WriteStats, Error>> {
		try {
			const filePath = resolve(this.basePath, options.fileName);
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
