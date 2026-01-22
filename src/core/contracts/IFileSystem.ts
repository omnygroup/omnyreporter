/**
 * File system contract
 * @module core/contracts/IFileSystem
 */

import type { WriteStats, FileOperationOptions } from '../types/index.js';

export interface IFileSystem {
	exists(path: string): Promise<boolean>;
	readFile(path: string): Promise<string>;
	readFileBuffer(path: string): Promise<Buffer>;
	writeFile(path: string, data: string | Buffer, options?: FileOperationOptions): Promise<WriteStats>;
	writeJson(path: string, data: unknown, options?: FileOperationOptions): Promise<WriteStats>;
	ensureDir(path: string): Promise<void>;
	removeFile(path: string): Promise<void>;
	removeDir(path: string): Promise<void>;
	readDir(path: string): Promise<string[]>;
	resolvePath(path: string): string;
}
