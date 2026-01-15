/**
 * Data sanitization using @pinojs/redact
 * @module infrastructure/security/RedactSanitizer
 */

import { injectable } from 'inversify';

import type { ISanitizer } from '../../core/index.js';

/**
 * Sanitizer implementation using @pinojs/redact
 * Masks sensitive data in messages and objects
 */
@injectable()
export class RedactSanitizer implements ISanitizer {
  // private readonly redactor: (obj: unknown) => unknown;

  public constructor() {
    // Configure redaction for sensitive keys
    // this.redactor = redactFn({
    //   paths: SENSITIVE_KEYS.flatMap((key) => [
    //     `${key}`,
    //     `*.${key}`,
    //     `**.${key}`,
    //   ]),
    //   censor: '[REDACTED]',
    // });
  }

  public sanitizeMessage(message: string): string {
    // Remove common sensitive patterns from messages
    return message
      .replace(/([A-Za-z0-9+/=]{20,})/g, '[TOKEN]') // Base64-like tokens
      .replace(/Bearer\s+\S+/gi, 'Bearer [TOKEN]')
      .replace(/password\s*[:=]\s*\S+/gi, 'password=[REDACTED]');
  }

  public sanitizePath(path: string): string {
    // Remove user home directory to avoid exposing paths
    return path.replace(/\/Users\/[^/]+/g, '/~').replace(/C:\\Users\\[^\\]+/g, 'C:\\~');
  }

  public sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    // TODO: Integrate redact function once API is finalized
    // const redacted = this.redactor(JSON.parse(JSON.stringify(obj)));
    // return redacted as T;
    return obj;
  }
}
