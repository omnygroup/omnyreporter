/**
 * RedactSanitizer unit tests
 * @module tests/unit/infrastructure/security/RedactSanitizer.test
 */

import 'reflect-metadata';
import { describe, it, expect } from 'vitest';

import { RedactSanitizer } from '../../../../src/infrastructure/security/RedactSanitizer.js';

describe('RedactSanitizer', () => {
	describe('sanitizeMessage', () => {
		it('should redact Base64-like tokens', () => {
			const sanitizer = new RedactSanitizer();
			const message = 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toBe('Token: [REDACTED]');
		});

		it('should redact Bearer tokens', () => {
			const sanitizer = new RedactSanitizer();
			const message = 'Auth header: Bearer abc123token456';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toContain('Bearer [REDACTED]');
		});

		it('should redact password patterns', () => {
			const sanitizer = new RedactSanitizer();
			const message = 'password=secret123';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toBe('password=[REDACTED]');
		});

		it('should redact API key patterns', () => {
			const sanitizer = new RedactSanitizer();
			const message = 'api_key=sk_live_abc123';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toBe('apiKey=[REDACTED]');
		});

		it('should not modify message when disabled', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: false,
					paths: true,
					messages: true,
					objects: true,
					redactPaths: [],
					censor: '[REDACTED]',
				},
			});
			const message = 'password=secret123';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toBe('password=secret123');
		});

		it('should not modify message when messages sanitization is disabled', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: true,
					paths: true,
					messages: false,
					objects: true,
					redactPaths: [],
					censor: '[REDACTED]',
				},
			});
			const message = 'password=secret123';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toBe('password=secret123');
		});

		it('should use custom censor string', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: true,
					paths: true,
					messages: true,
					objects: true,
					redactPaths: [],
					censor: '***HIDDEN***',
				},
			});
			const message = 'password=secret123';

			const result = sanitizer.sanitizeMessage(message);

			expect(result).toBe('password=***HIDDEN***');
		});
	});

	describe('sanitizePath', () => {
		it('should sanitize macOS user paths', () => {
			const sanitizer = new RedactSanitizer();
			const path = '/Users/johndoe/projects/app/src/file.ts';

			const result = sanitizer.sanitizePath(path);

			expect(result).toBe('/~/projects/app/src/file.ts');
		});

		it('should sanitize Linux home paths', () => {
			const sanitizer = new RedactSanitizer();
			const path = '/home/johndoe/projects/app/src/file.ts';

			const result = sanitizer.sanitizePath(path);

			expect(result).toBe('/~/projects/app/src/file.ts');
		});

		it('should sanitize Windows paths', () => {
			const sanitizer = new RedactSanitizer();
			const path = 'C:\\Users\\johndoe\\projects\\app\\src\\file.ts';

			const result = sanitizer.sanitizePath(path);

			expect(result).toBe('C:\\~\\projects\\app\\src\\file.ts');
		});

		it('should not modify non-user paths', () => {
			const sanitizer = new RedactSanitizer();
			const path = '/var/log/app.log';

			const result = sanitizer.sanitizePath(path);

			expect(result).toBe('/var/log/app.log');
		});

		it('should not modify path when disabled', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: false,
					paths: true,
					messages: true,
					objects: true,
					redactPaths: [],
					censor: '[REDACTED]',
				},
			});
			const path = '/Users/johndoe/projects/app/src/file.ts';

			const result = sanitizer.sanitizePath(path);

			expect(result).toBe('/Users/johndoe/projects/app/src/file.ts');
		});

		it('should not modify path when paths sanitization is disabled', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: true,
					paths: false,
					messages: true,
					objects: true,
					redactPaths: [],
					censor: '[REDACTED]',
				},
			});
			const path = '/Users/johndoe/projects/app/src/file.ts';

			const result = sanitizer.sanitizePath(path);

			expect(result).toBe('/Users/johndoe/projects/app/src/file.ts');
		});
	});

	describe('sanitizeObject', () => {
		it('should redact sensitive fields in objects', () => {
			const sanitizer = new RedactSanitizer();
			const obj = {
				username: 'john',
				password: 'secret123',
				email: 'john@example.com',
			};

			const result = sanitizer.sanitizeObject(obj);

			expect(result.username).toBe('john');
			expect(result.password).toBe('[REDACTED]');
			expect(result.email).toBe('john@example.com');
		});

		it('should redact nested sensitive fields with wildcard paths', () => {
			const sanitizer = new RedactSanitizer();
			// Default paths include '*.password' and '*.token' which match one level deep
			const obj = {
				user: {
					name: 'john',
					password: 'secret123',
					token: 'abc123',
				},
			};

			const result = sanitizer.sanitizeObject(obj);

			expect(result.user.name).toBe('john');
			expect(result.user.password).toBe('[REDACTED]');
			expect(result.user.token).toBe('[REDACTED]');
		});

		it('should sanitize path-like strings in objects', () => {
			const sanitizer = new RedactSanitizer();
			const obj = {
				filePath: '/Users/johndoe/projects/app/file.ts',
				name: 'test',
			};

			const result = sanitizer.sanitizeObject(obj);

			expect(result.filePath).toBe('/~/projects/app/file.ts');
			expect(result.name).toBe('test');
		});

		it('should not mutate original object', () => {
			const sanitizer = new RedactSanitizer();
			const original = {
				password: 'secret123',
			};

			sanitizer.sanitizeObject(original);

			expect(original.password).toBe('secret123');
		});

		it('should not modify object when disabled', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: false,
					paths: true,
					messages: true,
					objects: true,
					redactPaths: [],
					censor: '[REDACTED]',
				},
			});
			const obj = {
				password: 'secret123',
			};

			const result = sanitizer.sanitizeObject(obj);

			expect(result.password).toBe('secret123');
		});

		it('should use custom redact paths', () => {
			const sanitizer = new RedactSanitizer({
				sanitization: {
					enabled: true,
					paths: true,
					messages: true,
					objects: true,
					redactPaths: ['customSecret'],
					censor: '[HIDDEN]',
				},
			});
			const obj = {
				customSecret: 'my-secret',
				password: 'not-redacted',
			};

			const result = sanitizer.sanitizeObject(obj);

			expect(result.customSecret).toBe('[HIDDEN]');
			expect(result.password).toBe('not-redacted');
		});
	});

	describe('default configuration', () => {
		it('should use defaults when no config provided', () => {
			const sanitizer = new RedactSanitizer();

			expect(sanitizer.sanitizeMessage('password=test')).toBe('password=[REDACTED]');
			expect(sanitizer.sanitizePath('/Users/test/file.ts')).toBe('/~/file.ts');
		});

		it('should use defaults when config is undefined', () => {
			const sanitizer = new RedactSanitizer(undefined);

			expect(sanitizer.sanitizeMessage('password=test')).toBe('password=[REDACTED]');
		});
	});
});
