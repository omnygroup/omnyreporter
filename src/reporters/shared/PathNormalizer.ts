/**
 * Path normalization utility with cross-platform support and caching
 */

import path from 'node:path';

import type { PathNormalizer } from '../interfaces.js';

export class PathNormalizerImpl implements PathNormalizer {
	readonly #cache: Map<string, string>;
	readonly #baseDir: string;

	public constructor(baseDir: string = process.cwd()) {
		this.#cache = new Map();
		this.#baseDir = path.normalize(baseDir);
	}

	public normalize(rawPath: string, baseDir?: string): string {
		if (rawPath === '') {
			return '';
		}

		const cacheKey = `${rawPath}:${baseDir ?? ''}`;
		const cached = this.#cache.get(cacheKey);
		if (cached !== undefined) {
			return cached;
		}

		const base = baseDir !== undefined && baseDir !== '' ? path.normalize(baseDir) : this.#baseDir;
		let normalized = rawPath.replace(/\\/g, '/');

		// Handle absolute paths
		if (this.isAbsolute(rawPath)) {
			const absolutePath = path.normalize(rawPath);
			if (absolutePath.startsWith(base)) {
				normalized = path.relative(base, absolutePath).replace(/\\/g, '/');
			} else {
				normalized = absolutePath.replace(/\\/g, '/');
			}
		} else {
			// Ensure relative path
			normalized = path.normalize(normalized).replace(/\\/g, '/');
		}

		// Remove leading ./
		if (normalized.startsWith('./')) {
			normalized = normalized.slice(2);
		}

		this.#cache.set(cacheKey, normalized);
		return normalized;
	}

	public isAbsolute(filePath: string): boolean {
		return path.isAbsolute(filePath);
	}

	/**
	 * Clear the normalization cache
	 */
	public clearCache(): void {
		this.#cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	public getCacheStats(): { size: number; baseDir: string } {
		return {
			size: this.#cache.size,
			baseDir: this.#baseDir,
		};
	}
}
