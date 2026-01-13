/**
 * Directory manager for .omnyreporter structure
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export class DirectoryManager {
	readonly #baseOutputDir: string;

	public constructor(baseOutputDir?: string, cwd: string = process.cwd()) {
		this.#baseOutputDir = baseOutputDir ?? path.join(cwd, '.omnyreporter');
	}

	/**
	 * Get the output directory for a specific reporter type
	 */
	public getOutputDir(type: 'eslint' | 'typescript'): string {
		return path.join(this.#baseOutputDir, type, 'errors');
	}

	/**
	 * Get the root .omnyreporter directory
	 */
	public getRootDir(): string {
		return this.#baseOutputDir;
	}

	/**
	 * Ensure all necessary directories exist
	 */
	public async ensureDirectories(type: 'eslint' | 'typescript'): Promise<void> {
		const outputDir = this.getOutputDir(type);
		await fs.mkdir(outputDir, { recursive: true });
	}

	/**
	 * Clean the output directory for a specific type
	 */
	public async cleanOutputDir(type: 'eslint' | 'typescript'): Promise<void> {
		const outputDir = this.getOutputDir(type);
		try {
			await fs.rm(outputDir, { recursive: true, force: true });
			await fs.mkdir(outputDir, { recursive: true });
		} catch (error) {
			// Ignore errors if directory doesn't exist
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw error;
			}
		}
	}

	/**
	 * Get file path for a diagnostic file
	 */
	public getFilePath(type: 'eslint' | 'typescript', normalizedPath: string): string {
		const outputDir = this.getOutputDir(type);
		const fileName = normalizedPath.replace(/\//g, '_');
		const extension = type === 'eslint' ? '.eslint-errors.json' : '.tsc-errors.json';
		return path.join(outputDir, fileName + extension);
	}

	/**
	 * Check if directories are writable
	 */
	public async isWritable(type: 'eslint' | 'typescript'): Promise<boolean> {
		try {
			const outputDir = this.getOutputDir(type);
			await fs.mkdir(outputDir, { recursive: true });
			await fs.access(outputDir, fs.constants.W_OK);
			return true;
		} catch {
			return false;
		}
	}
}
