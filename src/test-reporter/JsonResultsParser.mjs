import fs from 'fs';

export class JsonResultsParser {
	parse(filePath) {
		console.warn(`📄 Parsing test results from: ${filePath}`);

		let jsonContent;
		try {
			jsonContent = fs.readFileSync(filePath, 'utf8');
		} catch (error) {
			throw new Error(`Failed to read JSON file: ${error.message}`);
		}

		let rawData;
		try {
			rawData = JSON.parse(jsonContent);
		} catch (error) {
			this.#saveRawOutput(jsonContent, error);
			throw new Error(`Invalid JSON from Vitest: ${error.message}`);
		}

		const validatedData = this.#validateStructure(rawData);

		console.warn(`✅ Parsed ${validatedData.numTotalTestSuites} test suites`);

		return validatedData;
	}

	#validateStructure(data) {
		const requiredFields = [
			'testResults',
			'numTotalTestSuites',
			'numPassedTestSuites',
			'numFailedTestSuites',
			'numTotalTests',
			'numPassedTests',
			'numFailedTests',
		];

		const missingFields = requiredFields.filter((field) => !(field in data));

		if (missingFields.length > 0) {
			console.warn(`⚠️  Warning: Missing expected fields in Vitest output: ${missingFields.join(', ')}`);
		}

		if (!Array.isArray(data.testResults)) {
			throw new Error('Invalid Vitest output: testResults must be an array');
		}

		return {
			numTotalTestSuites: this.#safeGet(data, 'numTotalTestSuites', 0),
			numPassedTestSuites: this.#safeGet(data, 'numPassedTestSuites', 0),
			numFailedTestSuites: this.#safeGet(data, 'numFailedTestSuites', 0),
			numTotalTests: this.#safeGet(data, 'numTotalTests', 0),
			numPassedTests: this.#safeGet(data, 'numPassedTests', 0),
			numFailedTests: this.#safeGet(data, 'numFailedTests', 0),
			testResults: data.testResults.map((suite) => this.#validateTestSuite(suite)),
			startTime: this.#safeGet(data, 'startTime', Date.now()),
			success: this.#safeGet(data, 'success', data.numFailedTests === 0),
		};
	}

	#validateTestSuite(suite) {
		if (!suite.name || typeof suite.name !== 'string') {
			console.warn('⚠️  Warning: Test suite missing name field');
		}

		if (!Array.isArray(suite.assertionResults)) {
			console.warn(`⚠️  Warning: Test suite ${suite.name} missing assertionResults array`);
		}

		return {
			name: this.#safeGet(suite, 'name', 'Unknown Test Suite'),
			status: this.#safeGet(suite, 'status', 'unknown'),
			duration: this.#safeGet(suite, 'duration', 0),
			assertionResults: Array.isArray(suite.assertionResults)
				? suite.assertionResults.map((test) => this.#validateAssertion(test))
				: [],
		};
	}

	#validateAssertion(assertion) {
		return {
			title: this.#safeGet(assertion, 'title', 'Unknown Test'),
			fullName: this.#safeGet(assertion, 'fullName', assertion.title || 'Unknown Test'),
			status: this.#safeGet(assertion, 'status', 'unknown'),
			duration: this.#safeGet(assertion, 'duration', 0),
			failureMessages: Array.isArray(assertion.failureMessages) ? assertion.failureMessages : [],
			location: assertion.location || null,
			retryCount: this.#safeGet(assertion, 'retryCount', 0),
		};
	}

	#safeGet(obj, path, defaultValue) {
		if (!obj) return defaultValue;

		const keys = path.split('.');
		let value = obj;

		for (const key of keys) {
			if (value && typeof value === 'object' && key in value) {
				value = value[key];
			} else {
				return defaultValue;
			}
		}

		return value !== undefined ? value : defaultValue;
	}

	#saveRawOutput(content, error) {
		try {
			const outputPath = 'tests-errors/raw-output.txt';

			if (!fs.existsSync('tests-errors')) {
				fs.mkdirSync('tests-errors', { recursive: true });
			}

			fs.writeFileSync(outputPath, content, 'utf8');

			const errorPath = 'tests-errors/parse-error.txt';
			fs.writeFileSync(errorPath, `Parse Error: ${error.message}\n\nStack:\n${error.stack}`, 'utf8');

			console.error(`❌ Invalid JSON saved to: ${outputPath}`);
			console.error(`   Error details saved to: ${errorPath}`);
		} catch (writeError) {
			console.error(`⚠️  Could not save raw output: ${writeError.message}`);
		}
	}
}
