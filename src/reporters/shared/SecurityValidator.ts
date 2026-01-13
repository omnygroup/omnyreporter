/**
 * Security validator for file paths and messages
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { SecurityValidator } from '../interfaces.js';

export class SecurityValidatorImpl implements SecurityValidator {
	readonly #cwd: string;
	readonly #policy: 'strict' | 'moderate';
	readonly #allowedPaths: Set<string>;
	readonly #sensitivePatterns: RegExp[];

	public constructor(cwd: string = process.cwd(), policy: 'strict' | 'moderate' = 'strict') {
		this.#cwd = path.resolve(cwd);
		this.#policy = policy;
		this.#allowedPaths = new Set([this.#cwd]);

		// Patterns for sensitive data detection
		this.#sensitivePatterns = [
			// Absolute paths that might contain usernames
			/[A-Z]:\\Users\\[^\\]+/gi,
			/\/home\/[^/]+/gi,
			/\/Users\/[^/]+/gi,
			// Environment variables
			/\$\{[A-Z_]+\}/gi,
			/%[A-Z_]+%/gi,
			// API keys and tokens (common patterns)
			/api[_-]?key[:\s=]+['"]?[a-zA-Z0-9_-]{16,}['"]?/gi,
			/token[:\s=]+['"]?[a-zA-Z0-9_-]{16,}['"]?/gi,
			// Password patterns
			/password[:\s=]+['"]?[^\s'"]+['"]?/gi,
		];
	}

	public isPathSafe(filePath: string): boolean {
		try {
			const resolved = path.resolve(this.#cwd, filePath);
			const normalized = path.normalize(resolved);

			// Check if path is within allowed directories
			if (!normalized.startsWith(this.#cwd)) {
				// In moderate mode, allow node_modules and common build dirs
				if (this.#policy === 'moderate') {
					return this.#isAllowedBuildDir(normalized);
				}
				return false;
			}

			// Check for path traversal attempts
			if (normalized.includes('..')) {
				return false;
			}

			// Strict mode: disallow system directories
			if (this.#policy === 'strict' && this.#isSystemDir(normalized)) {
				return false;
			}

			return true;
		} catch {
			return false;
		}
	}

	private #isAllowedBuildDir(normalized: string): boolean {
		const relativePath = path.relative(this.#cwd, normalized);
		const parts = relativePath.split(path.sep);
		const firstSegment = parts.length > 0 ? parts[0] : undefined;
		return firstSegment !== undefined && ['node_modules', 'dist', 'build', '.git'].includes(firstSegment);
	}

	private #isSystemDir(normalized: string): boolean {
		const systemDirs = ['/etc', '/sys', '/proc', 'C:\\Windows', 'C:\\System'];
		return systemDirs.some((sysDir) => normalized.startsWith(sysDir));
	}

	public sanitizeMessage(message: string): string {
		let sanitized = message;
		sanitized = this.#redactSensitivePatterns(sanitized);

		// Replace absolute paths with relative ones
		sanitized = this.#replaceCwdWithDot(sanitized);

		// Replace home directory
		sanitized = this.#replaceHomeDir(sanitized);

		return sanitized;
	}

	private #redactSensitivePatterns(text: string): string {
		let result = text;
		for (const pattern of this.#sensitivePatterns) {
			result = result.replace(pattern, (match) => {
				// Keep structure but redact content
				if (match.includes('\\Users\\') || match.includes('/home/') || match.includes('/Users/')) {
					return match.replace(/[^/\\]+(?=[/\\]|$)/g, '***');
				}
				return '[REDACTED]';
			});
		}
		return result;
	}

	private #replaceCwdWithDot(text: string): string {
		const cwdPattern = new RegExp(this.#cwd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
		return text.replace(cwdPattern, '.');
	}

	private #replaceHomeDir(text: string): string {
		const homeDir = os.homedir();
		const homePattern = new RegExp(homeDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
		return text.replace(homePattern, '~');
	}

	public async validateOutputDirectory(directory: string): Promise<boolean> {
		try {
			// Check if path is safe
			if (!this.isPathSafe(directory)) {
				return false;
			}

			const resolved = path.resolve(this.#cwd, directory);

			// Try to access the directory
			try {
				await fs.access(resolved, fs.constants.W_OK);
				return true;
			} catch {
				// Directory might not exist, try to create parent
				const parent = path.dirname(resolved);
				try {
					await fs.access(parent, fs.constants.W_OK);
					return true;
				} catch {
					return false;
				}
			}
		} catch {
			return false;
		}
	}

	/**
	 * Add an allowed path for security checks
	 */
	public addAllowedPath(allowedPath: string): void {
		const resolved = path.resolve(allowedPath);
		this.#allowedPaths.add(resolved);
	}
}
