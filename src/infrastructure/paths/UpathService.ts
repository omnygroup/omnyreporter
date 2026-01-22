/**
 * Unified path service using upath
 * @module infrastructure/paths/UpathService
 */

import { injectable } from 'inversify';
import upath from 'upath';

import type { IPathService } from '../../core/index.js';

/**
 * Path service implementation using upath
 * Provides cross-platform path handling with consistent forward slashes
 */
@injectable()
export class UpathService implements IPathService {
	public normalize(path: string): string {
		return upath.normalize(path);
	}

	public join(...segments: string[]): string {
		return upath.join(...segments);
	}

	public dirname(path: string): string {
		return upath.dirname(path);
	}

	public basename(path: string, ext?: string): string {
		return upath.basename(path, ext);
	}

	public extname(path: string): string {
		return upath.extname(path);
	}

	public isAbsolute(path: string): boolean {
		return upath.isAbsolute(path);
	}

	public relative(from: string, to: string): string {
		return upath.relative(from, to);
	}

	public resolve(...segments: string[]): string {
		return upath.resolve(...segments);
	}
}
