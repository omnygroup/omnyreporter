/**
 * Mock implementation of IFileSystem for testing
 * @module tests/mocks/MockFileSystem
 */

import type { IFileSystem } from '../../src/core/contracts/index.js';
import type { WriteStats, WriteOptions } from '../../src/core/types/index.js';

export class MockFileSystem implements IFileSystem {
  private files = new Map<string, string | Buffer>();
  private directories = new Set<string>();

  async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.directories.has(path);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    if (Buffer.isBuffer(content)) {
      return content.toString();
    }
    return content;
  }

  async readFileBuffer(path: string): Promise<Buffer> {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    if (Buffer.isBuffer(content)) {
      return content;
    }
    return Buffer.from(content);
  }

  async writeFile(path: string, data: string | Buffer, _options?: WriteOptions): Promise<WriteStats> {
    const dirPath = path.substring(0, path.lastIndexOf('/'));
    if (dirPath) {
      this.directories.add(dirPath);
    }
    this.files.set(path, data);
    return { bytesWritten: Buffer.byteLength(data), path };
  }

  async writeJson(path: string, data: unknown, _options?: WriteOptions): Promise<WriteStats> {
    const content = JSON.stringify(data, null, 2);
    return this.writeFile(path, content);
  }

  async ensureDir(path: string): Promise<void> {
    this.directories.add(path);
  }

  async remove(path: string): Promise<void> {
    this.files.delete(path);
    this.directories.delete(path);
  }

  async readDir(path: string): Promise<string[]> {
    const prefix = path.endsWith('/') ? path : `${path}/`;
    const items: string[] = [];
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const relative = filePath.substring(prefix.length);
        if (!relative.includes('/')) {
          items.push(relative);
        }
      }
    }
    return items;
  }

  setFile(path: string, content: string | Buffer): void {
    this.files.set(path, content);
  }

  setDirectory(path: string): void {
    this.directories.add(path);
  }

  getFiles(): Map<string, string | Buffer> {
    return new Map(this.files);
  }

  clear(): void {
    this.files.clear();
    this.directories.clear();
  }
}
