/**
 * Sanitizer contract for sensitive data
 * @module core/contracts/ISanitizer
 */

export interface ISanitizer {
	sanitizeMessage(message: string): string;
	sanitizePath(path: string): string;
	sanitizeObject<T extends Record<string, unknown>>(obj: T): T;
}
