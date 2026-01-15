/**
 * Path validation service
 * @module infrastructure/security/PathValidator
 */

// Inversify decorator - import needed for @injectable decorator to work at runtime
import { injectable } from 'inversify';
import upath from 'upath';

import { FileSystemError ,type  IPathService } from '../../core/index.js';

/**
 * Service for validating paths for security and normalization
 */
@injectable()
export class PathValidator {
  public constructor(private readonly pathService: IPathService) {}

  /**
   * Validate path is safe and within allowed scope
   * @param path Path to validate
   * @param basePath Optional base path to restrict relative to
   * @returns Normalized path
   * @throws FileSystemError if path is invalid or escapes base
   */
  public validatePath(path: string, basePath?: string): string {
    const normalized = this.pathService.normalize(path);

    // Check for null bytes
    if (normalized.includes('\0')) {
      throw new FileSystemError('Path contains null bytes', { path });
    }

    // If base path provided, ensure normalized path is within base
    if (basePath) {
      const normalizedBase = this.pathService.normalize(basePath);
      const relative = this.pathService.relative(normalizedBase, normalized);

      if (relative.startsWith('..') || upath.isAbsolute(relative)) {
        throw new FileSystemError('Path escapes base directory', { path, basePath });
      }
    }

    return normalized;
  }

  /**
   * Check if path is safe (doesn't escape boundaries)
   * @param path Path to check
   * @param basePath Base path boundary
   * @returns True if safe
   */
  public isSafe(path: string, basePath?: string): boolean {
    try {
      this.validatePath(path, basePath);
      return true;
    } catch {
      return false;
    }
  }
}
