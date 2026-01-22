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
		await Promise.resolve();
		return this.files.has(path) || this.directories.has(path);
	}

	async readFile(path: string): Promise<string> {
		const content = this.files.get(path);
		if (content === undefined) {
			throw new Error(`File not found: ${path}`);
		}
		await Promise.resolve();
		if (Buffer.isBuffer(content)) {
			return content.toString();
		}
		return content;
	}

	async readFileBuffer(path: string): Promise<Buffer> {
		const content = this.files.get(path);
		if (content === undefined) {
			throw new Error(`File not found: ${path}`);
		}
		await Promise.resolve();
		if (Buffer.isBuffer(content)) {
			return content;
		}
		return Buffer.from(content);
	}

	async writeFile(path: string, data: string | Buffer, _options?: WriteOptions): Promise<WriteStats> {
		await Promise.resolve();
		const dirPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
		if (dirPath !== '') {
			this.directories.add(dirPath);
		}
		this.files.set(path, data);
		const bytesWritten = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
		return { bytesWritten, path };
	}

	async writeJson(path: string, data: unknown, _options?: WriteOptions): Promise<WriteStats> {
		const content = JSON.stringify(data, null, 2);
		return await this.writeFile(path, content);
	}

	async ensureDir(path: string): Promise<void> {
		this.directories.add(path);
		await Promise.resolve();
	}

	async remove(path: string): Promise<void> {
		this.files.delete(path);
		this.directories.delete(path);
		await Promise.resolve();
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
		await Promise.resolve();
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
