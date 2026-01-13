import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Commented out: No longer needed for current implementation
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Type guard to check if an error is a Node.js error with a code property
 */
interface NodeError extends Error {
	code?: string;
}

/**
 * Get a safe error message from an unknown error
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'Unknown error';
}

/**
 * Check if an error is a Node.js error with a code property
 */
function isNodeError(error: unknown): error is NodeError {
	return error instanceof Error && 'code' in error;
}

export interface ExecutionResult {
	outputFilePath: string;
	exitCode: number;
	stdout: string;
	stderr: string;
}

export class VitestExecutor {
	/** Default timeout for test execution (10 minutes) */
	#defaultTimeout = 10 * 60 * 1000;

	/** Temporary output file for JSON results */
	#tempOutputFile = 'test-results-temp.json';

	/** Project root directory */
	#projectRoot: string;

	constructor(options: { timeout?: number; tempOutputFile?: string } = {}) {
		this.#defaultTimeout = options.timeout ?? this.#defaultTimeout;
		this.#tempOutputFile = options.tempOutputFile ?? this.#tempOutputFile;

		// Use the current working directory as the project root so the reporter
		// runs Vitest in the calling project (not inside the reporter package).
		this.#projectRoot = process.cwd();
	}

	async execute(): Promise<ExecutionResult> {
		const outputFilePath = path.join(this.#projectRoot, this.#tempOutputFile);

		// Clean up any existing temp file
		this.#cleanupTempFile(outputFilePath);

		console.warn('🧪 Running Vitest tests with JSON reporter...\n');

		const startTime = Date.now();

		try {
			const result = await this.#spawnVitest(outputFilePath);

			const duration = String(Date.now() - startTime);
			console.warn(`\n⏱️  Test execution completed in ${duration}ms`);

			return result;
		} catch (error) {
			// Clean up on error
			this.#cleanupTempFile(outputFilePath);
			throw error;
		}
	}

	async #spawnVitest(outputFilePath: string): Promise<ExecutionResult> {
		return new Promise((resolve, reject) => {
			const args = [
				'run', // Non-watch mode
				'--reporter=json', // JSON reporter
				`--outputFile=${this.#tempOutputFile}`, // Output to temp file
				'--reporter=default', // Also show progress in console
			];

			const vitestProcess = spawn('npx', ['vitest', ...args], {
				cwd: this.#projectRoot,
				shell: true,
				env: { ...process.env, CI: 'true' }, // CI mode for non-interactive
			});

			let stdout = '';
			let stderr = '';
			let timeoutHandle: NodeJS.Timeout | null = null;

			if (this.#defaultTimeout > 0) {
				timeoutHandle = setTimeout(() => {
					const timeoutSeconds = String(this.#defaultTimeout / 1000);
					console.warn(`\n⏱️  Warning: Test execution exceeded ${timeoutSeconds}s timeout`);
					vitestProcess.kill('SIGTERM');

					// Force kill after 5 seconds if not terminated
					setTimeout(() => {
						if (!vitestProcess.killed) {
							vitestProcess.kill('SIGKILL');
						}
					}, 5000);
				}, this.#defaultTimeout);
			}

			vitestProcess.stdout.on('data', (data: Buffer) => {
				const output = data.toString();
				stdout += output;
				process.stdout.write(output);
			});

			vitestProcess.stderr.on('data', (data: Buffer) => {
				const output = data.toString();
				stderr += output;
				process.stderr.write(output);
			});

			vitestProcess.on('error', (error: unknown) => {
				if (timeoutHandle !== null) clearTimeout(timeoutHandle);

				if (isNodeError(error) && error.code === 'ENOENT') {
					reject(new Error('❌ Vitest not found. Please install it: npm install --save-dev vitest'));
				} else {
					const errorMessage = getErrorMessage(error);
					reject(new Error(`❌ Failed to execute Vitest: ${errorMessage}`));
				}
			});

			vitestProcess.on('close', (exitCode: number | null) => {
				if (timeoutHandle !== null) clearTimeout(timeoutHandle);

				if (!fs.existsSync(outputFilePath)) {
					reject(
						new Error(`❌ Vitest did not create output file at ${outputFilePath}. Check stderr for errors.`)
					);
					return;
				}

				try {
					fs.readFileSync(outputFilePath, 'utf8');
				} catch (readError: unknown) {
					const errorMessage = getErrorMessage(readError);
					reject(new Error(`❌ Failed to read output file: ${errorMessage}`));
					return;
				}

				resolve({
					outputFilePath,
					exitCode: exitCode ?? 0,
					stdout,
					stderr,
				});
			});
		});
	}

	#cleanupTempFile(filePath: string): void {
		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error);
			console.warn(`⚠️  Warning: Could not clean up temp file: ${errorMessage}`);
		}
	}

	cleanup(): void {
		const outputFilePath = path.join(this.#projectRoot, this.#tempOutputFile);
		this.#cleanupTempFile(outputFilePath);
	}
}
