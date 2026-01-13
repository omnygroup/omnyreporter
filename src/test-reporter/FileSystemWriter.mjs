import fs from 'fs';
import path from 'path';

import { PathNormalizer } from './PathNormalizer.mjs';

export class FileSystemWriter {
	#outputDir = 'tests-errors';
	#pathNormalizer;

	constructor(options = {}) {
		this.#outputDir = options.outputDir || this.#outputDir;
		this.#pathNormalizer = new PathNormalizer();
	}

	async write(aggregatedErrors) {
		const { errorsByFile } = aggregatedErrors;

		if (errorsByFile.size === 0) {
			console.warn('✅ All tests passed! Cleaning up error reports...');
			this.#deleteOutputDirectory();
			return;
		}

		console.warn(`💾 Writing ${errorsByFile.size} error report files...`);

		this.#deleteOutputDirectory();
		this.#ensureDirectoryExists(this.#outputDir);

		let filesWritten = 0;
		for (const [testFile, failures] of errorsByFile.entries()) {
			await this.#writeErrorFile(testFile, failures);
			filesWritten++;
		}

		console.warn(`✅ Successfully wrote ${filesWritten} error report files to ${this.#outputDir}/`);
	}

	async #writeErrorFile(testFile, failures) {
		const normalizedPath = this.#pathNormalizer.normalize(testFile);

		const fileDir = this.#pathNormalizer.getDirectory(normalizedPath);
		if (fileDir) {
			const fullDir = path.join(this.#outputDir, fileDir);
			this.#ensureDirectoryExists(fullDir);
		}

		const fileName = normalizedPath.replace(/\//g, '_') + '.test-errors.json';
		const outputPath = path.join(this.#outputDir, fileName);

		const schemaPath = this.#calculateSchemaPath(outputPath);

		const testSuite = undefined;

		const summary = this.#buildTestFileSummary(testSuite, failures);

		const errorReport = {
			$schema: schemaPath,
			testFile: normalizedPath,
			timestamp: new Date().toISOString(),
			summary,
			failures,
		};

		try {
			const jsonContent = JSON.stringify(errorReport, null, 2);

			const tempPath = outputPath + '.tmp';
			fs.writeFileSync(tempPath, jsonContent, { encoding: 'utf8', mode: 0o644 });

			fs.renameSync(tempPath, outputPath);
		} catch (error) {
			throw new Error(`Failed to write error file ${outputPath}: ${error.message}`);
		}
	}

	#buildTestFileSummary(testSuite, failures) {
		if (!testSuite) {
			return {
				totalTests: failures.length,
				passedTests: 0,
				failedTests: failures.length,
				skippedTests: 0,
				duration: failures.reduce((sum, f) => sum + f.duration, 0),
			};
		}

		const totalTests = testSuite.assertionResults.length;
		const failedTests = failures.length;
		const passedTests = testSuite.assertionResults.filter((t) => t.status === 'passed').length;
		const skippedTests = totalTests - passedTests - failedTests;

		return {
			totalTests,
			passedTests,
			failedTests,
			skippedTests,
			duration: testSuite.duration || 0,
		};
	}

	#ensureDirectoryExists(dirPath) {
		try {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
			}
		} catch (error) {
			if (error.code === 'EACCES') {
				throw new Error(`Permission denied: Cannot create directory ${dirPath}. Check file permissions.`);
			} else if (error.code === 'ENOSPC') {
				throw new Error(`Disk full: Cannot create directory ${dirPath}. Free up disk space.`);
			}
			throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
		}
	}

	#deleteOutputDirectory() {
		try {
			if (fs.existsSync(this.#outputDir)) {
				fs.rmSync(this.#outputDir, { recursive: true, force: true });
			}
		} catch (error) {
			console.warn(`⚠️  Warning: Could not delete output directory: ${error.message}`);
		}
	}

	#calculateSchemaPath(outputPath) {
		// Calculate schema path relative to the output file
		const depth = outputPath.split(path.sep).length - 1;
		return './' + Array(depth).fill('..').join('/') + '/schema.json';
	}

	getOutputDir() {
		return this.#outputDir;
	}
}
