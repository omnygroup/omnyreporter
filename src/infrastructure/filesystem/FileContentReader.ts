/**
 * File content reader service
 * Reads source code files with metadata
 * @module infrastructure/filesystem/FileContentReader
 */

import { injectable, inject } from 'inversify';

import { FileSystemError, type FileContent, type IFileSystem, type IPathService, type Result, ok, err } from '../../core/index.js';
import { TOKENS } from '../../diTokens.js';

/**
 * Reads file content and calculates metadata
 */
@injectable()
export class FileContentReader {
  public constructor(
    @inject(TOKENS.FileSystem) private readonly fileSystem: IFileSystem,
    @inject(TOKENS.PathService) private readonly pathService: IPathService
  ) {}

  /**
   * Read file content with metadata
   * @param filePath Path to file
   * @returns Result with file content and metadata
   */
  public async read(filePath: string): Promise<Result<FileContent, Error>> {
    try {
      const sourceCode = await this.fileSystem.readFile(filePath);
      const absolutePath = this.pathService.resolve(filePath);
      const size = Buffer.byteLength(sourceCode, 'utf-8');
      const lineCount = sourceCode.split('\n').length;

      return ok({
        absolutePath,
        relativePath: filePath,
        sourceCode,
        encoding: 'utf-8',
        lineCount,
        size,
      });
    } catch (error) {
      return err(
        new FileSystemError(
          `Failed to read file: ${filePath}`,
          { filePath },
          error as Error
        )
      );
    }
  }
}
