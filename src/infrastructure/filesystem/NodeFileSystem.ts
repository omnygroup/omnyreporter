/**
 * Node.js file system implementation
 * @module infrastructure/filesystem/NodeFileSystem
 */

import { injectable } from 'inversify';
import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';
import * as fsExtra from 'fs-extra';

import type { IFileSystem } from '../../core/index.js';
import type { WriteStats, WriteOptions } from '../../core/index.js';
import { FileSystemError } from '../../core/index.js';

/**
 * File system implementation using Node.js fs module
 * Provides atomic writes, automatic directory creation, and JSON handling
 */
@injectable()
export class NodeFileSystem implements IFileSystem {
  public async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  public async readFile(path: string): Promise<string> {
    try {
      return await fs.readFile(path, 'utf-8');
    } catch (error) {
      throw new FileSystemError(`Failed to read file: ${path}`, { path }, error as Error);
    }
  }

  public async readFileBuffer(path: string): Promise<Buffer> {
    try {
      return await fs.readFile(path);
    } catch (error) {
      throw new FileSystemError(`Failed to read file buffer: ${path}`, { path }, error as Error);
    }
  }

  public async writeFile(
    path: string,
    data: string | Buffer,
    options: WriteOptions = {}
  ): Promise<WriteStats> {
    const startTime = Date.now();

    try {
      const resolvedPath = resolve(path);

      if (options.ensureDir !== false) {
        const dir = dirname(resolvedPath);
        await fsExtra.ensureDir(dir);
      }

      const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;

      if (options.atomic !== false) {
        // Atomic write using temp file
        const tempPath = `${resolvedPath}.tmp`;
        await fs.writeFile(tempPath, buffer);
        await fs.rename(tempPath, resolvedPath);
      } else {
        await fs.writeFile(resolvedPath, buffer);
      }

      return {
        filesWritten: 1,
        bytesWritten: buffer.length,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new FileSystemError(`Failed to write file: ${path}`, { path }, error as Error);
    }
  }

  public async writeJson(
    path: string,
    data: unknown,
    options: WriteOptions = {}
  ): Promise<WriteStats> {
    const startTime = Date.now();

    try {
      const resolvedPath = resolve(path);

      if (options.ensureDir !== false) {
        const dir = dirname(resolvedPath);
        await fsExtra.ensureDir(dir);
      }

      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf-8');

      if (options.atomic !== false) {
        // Atomic write using temp file
        const tempPath = `${resolvedPath}.tmp`;
        await fs.writeFile(tempPath, buffer);
        await fs.rename(tempPath, resolvedPath);
      } else {
        await fs.writeFile(resolvedPath, buffer);
      }

      return {
        filesWritten: 1,
        bytesWritten: buffer.length,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new FileSystemError(`Failed to write JSON file: ${path}`, { path }, error as Error);
    }
  }

  public async ensureDir(path: string): Promise<void> {
    try {
      const resolvedPath = resolve(path);
      await fsExtra.ensureDir(resolvedPath);
    } catch (error) {
      throw new FileSystemError(`Failed to ensure directory: ${path}`, { path }, error as Error);
    }
  }

  public async removeFile(path: string): Promise<void> {
    try {
      const resolvedPath = resolve(path);
      await fs.unlink(resolvedPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new FileSystemError(
          `Failed to remove file: ${path}`,
          { path },
          error as Error
        );
      }
    }
  }

  public async removeDir(path: string): Promise<void> {
    try {
      const resolvedPath = resolve(path);
      await fsExtra.remove(resolvedPath);
    } catch (error) {
      throw new FileSystemError(
        `Failed to remove directory: ${path}`,
        { path },
        error as Error
      );
    }
  }

  public async readDir(path: string): Promise<string[]> {
    try {
      const resolvedPath = resolve(path);
      return await fs.readdir(resolvedPath);
    } catch (error) {
      throw new FileSystemError(
        `Failed to read directory: ${path}`,
        { path },
        error as Error
      );
    }
  }

  public resolvePath(path: string): string {
    return resolve(path);
  }
}
