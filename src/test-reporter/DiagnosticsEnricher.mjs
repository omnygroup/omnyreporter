import crypto from 'crypto';
import fs from 'fs';

import { PathNormalizer } from './PathNormalizer.mjs';

export class DiagnosticsEnricher {
	#pathNormalizer;
	#environmentInfo = null;
	#stackTracePattern = /at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/;
	#sensitivePatterns = [
		/password\s*[=:]\s*['"]?([^'"\\s]+)/gi,
		/token\s*[=:]\s*['"]?([^'"\\s]+)/gi,
		/api[_-]?key\s*[=:]\s*['"]?([^'"\\s]+)/gi,
		/secret\s*[=:]\s*['"]?([^'"\\s]+)/gi,
		/authorization:\s*['"]?([^'"\\s]+)/gi,
	];

	constructor() {
		this.#pathNormalizer = new PathNormalizer();
	}

	enrich(testResults) {
		console.warn('🔍 Enriching test failure diagnostics...');

		this.#environmentInfo = this.#collectEnvironmentInfo();

		const enrichedResults = [];
		let totalFailures = 0;

		for (const testSuite of testResults.testResults) {
			const failures = this.#enrichTestSuite(testSuite);

			if (failures.length > 0) {
				enrichedResults.push({
				testFile: testSuite.name,
				failures,
				});
				totalFailures += failures.length;
			}
		}

		console.warn(`✅ Enriched ${totalFailures} test failures with diagnostics`);

		return enrichedResults;
	}

	getEnvironmentInfo() {
		if (!this.#environmentInfo) {
			this.#environmentInfo = this.#collectEnvironmentInfo();
		}
		return this.#environmentInfo;
	}

	#enrichTestSuite(testSuite) {
		const failures = testSuite.assertionResults.filter((test) => test.status === 'failed');

		return failures.map((test) => this.#enrichTestFailure(test, testSuite.name));
	}

	#enrichTestFailure(test, testFile) {
		const allMessages = test.failureMessages.join('\n');

		const rawStackTrace = this.#extractStackTrace(allMessages);
		const parsedStackTrace = this.#parseStackTrace(rawStackTrace);

		const snapshotDiff = this.#extractSnapshotDiff(allMessages);

		const consoleLogs = this.#extractConsoleLogs(allMessages);

		const contentHash = this.#calculateContentHash(testFile, test.fullName);

		const sanitizedMessages = test.failureMessages.map((msg) => this.#sanitizeSensitiveData(msg));

		return {
			testName: test.title,
			fullName: test.fullName,
			status: test.status,
			duration: test.duration,
			retryCount: test.retryCount || 0,
			failureMessages: sanitizedMessages,
			rawStackTrace: this.#sanitizeSensitiveData(rawStackTrace),
			parsedStackTrace,
			location: test.location || this.#extractLocationFromStack(parsedStackTrace),
			snapshotDiff,
			consoleLogs: consoleLogs.map((log) => ({
				...log,
				message: this.#sanitizeSensitiveData(log.message),
			})),
			contentHash,
		};
	}

	#extractStackTrace(message) {
		const lines = message.split('\n');
		const stackLines = [];
		let inStack = false;

		for (const line of lines) {
			if (line.trim().startsWith('at ')) {
				inStack = true;
				stackLines.push(line);
			} else if (inStack && line.trim() === '') {
				break;
			} else if (inStack && !line.trim().startsWith('at ')) {
				break;
			}
		}

		return stackLines.length > 0 ? stackLines.join('\n') : message;
	}

	#parseStackTrace(stackTrace) {
		const frames = [];
		const lines = stackTrace.split('\n');

		for (const line of lines) {
			const match = line.match(this.#stackTracePattern);
			if (match) {
				const [, functionName, file, line, column] = match;

				const normalizedFile = this.#pathNormalizer.normalize(file);
				const isProjectFile = this.#pathNormalizer.isProjectFile(file);

				frames.push({
					file: normalizedFile,
					line: parseInt(line, 10),
					column: parseInt(column, 10),
					function: functionName || '(anonymous)',
					isProjectFile,
				});
			}
		}

		return frames;
	}

	#extractLocationFromStack(stackFrames) {
		const projectFrame = stackFrames.find((frame) => frame.isProjectFile);

		if (projectFrame) {
			return {
				file: projectFrame.file,
				line: projectFrame.line,
				column: projectFrame.column,
			};
		}

		return null;
	}

	#extractSnapshotDiff(message) {
		const snapshotPatterns = [
			/Expected:\s*([\s\S]*?)\s*Received:\s*([\s\S]*?)(?:\n\n|\n(?:at|$))/,
			/- Expected\s*\+ Received\s*([\s\S]*?)(?:\n\n|\n(?:at|$))/,
		];

		for (const pattern of snapshotPatterns) {
			const match = message.match(pattern);
			if (match) {
				if (pattern.source.includes('Expected.*Received')) {
					return {
						expected: match[1].trim(),
						received: match[2].trim(),
						diff: match[0],
					};
				} else {
					return {
						expected: '',
						received: '',
						diff: match[1].trim(),
					};
				}
			}
		}

		return null;
	}

	#extractConsoleLogs(message) {
		const logs = [];
		const lines = message.split('\n');

		const consolePattern = /^(stdout|stderr)\s*\|\s*(.+)$/;

		for (const line of lines) {
			const match = line.match(consolePattern);
			if (match) {
				const [, type, logMessage] = match;
				logs.push({
					type: type === 'stderr' ? 'error' : 'log',
					message: logMessage.trim(),
					timestamp: Date.now(),
				});
			}
		}

		return logs;
	}

	#calculateContentHash(testFile, testName) {
		try {
			const content = fs.readFileSync(testFile, 'utf8');

			const hash = crypto.createHash('sha256');
			hash.update(content);
			hash.update(testName);

			return hash.digest('hex').substring(0, 16);
		} catch {
			const hash = crypto.createHash('sha256');
			hash.update(testFile);
			hash.update(testName);
			return hash.digest('hex').substring(0, 16);
		}
	}

	#sanitizeSensitiveData(text) {
		let sanitized = text;

		for (const pattern of this.#sensitivePatterns) {
			sanitized = sanitized.replace(pattern, (match, capture) => {
				return match.replace(capture, '***REDACTED***');
			});
		}

		return sanitized;
	}

	#collectEnvironmentInfo() {
		let vitestVersion = 'unknown';
		try {
			const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
			vitestVersion = packageJson.devDependencies?.vitest ?? packageJson.dependencies?.vitest ?? 'unknown';
		} catch {
			// Default values will be used if package.json cannot be read
		}

		return {
			nodeVersion: process.version,
			vitestVersion,
			platform: process.platform,
			arch: process.arch,
		};
	}
}
