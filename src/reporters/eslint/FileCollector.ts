/**
 * File collector for ESLint
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Logger } from '../interfaces.js';

export interface FileCollector {
	/**
	 * Collect files matching patterns
	 */
	collectFiles(patterns: string[]): Promise<string[]>;
}

export class FileCollectorImpl implements FileCollector {
	readonly #cwd: string;
	readonly #logger: Logger;
	readonly #ignorePatterns: string[];
	readonly #extensions: string[];

	public constructor(
		cwd: string,
		logger: Logger,
		ignorePatterns: string[] = ['node_modules/**', 'dist/**', 'build/**'],
		extensions: string[] = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']
	) {
		this.#cwd = cwd;
		this.#logger = logger;
		this.#ignorePatterns = ignorePatterns;
		this.#extensions = extensions;
	}

	public async collectFiles(patterns: string[]): Promise<string[]> {
		// If patterns are provided, use them directly
		// ESLint will handle the globbing
		if (patterns.length > 0) {
			this.#logger.debug('Using provided file patterns', { patterns });
			return patterns;
		}

		// Default: collect all files with supported extensions
		this.#logger.debug('Collecting files with supported extensions');
		return this.#walkDirectory(this.#cwd);
	}

	async #walkDirectory(dir: string, files: string[] = []): Promise<string[]> {
		try {
			const entries = await fs.readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);
				const relativePath = path.relative(this.#cwd, fullPath);

				// Check ignore patterns
				if (this.#shouldIgnore(relativePath)) {
					continue;
				}

				if (entry.isDirectory()) {
					await this.#walkDirectory(fullPath, files);
				} else if (entry.isFile() && this.#hasValidExtension(entry.name)) {
					files.push(fullPath);
				}
			}
		} catch (error) {
			this.#logger.warn('Error reading directory', { dir, error });
		}

		return files;
	}

	#shouldIgnore(relativePath: string): boolean {
		const normalized = relativePath.replace(/\\/g, '/');
		
		for (const pattern of this.#ignorePatterns) {
			const regexPattern = pattern
				.replace(/\*\*/g, '.*')
				.replace(/\*/g, '[^/]*')
				.replace(/\?/g, '.');
			
			const regex = new RegExp(`^${regexPattern}$`);
			if (regex.test(normalized)) {
				return true;
			}
		}

		return false;
	}

	#hasValidExtension(fileName: string): boolean {
		return this.#extensions.some(ext => fileName.endsWith(ext));
	}
}
