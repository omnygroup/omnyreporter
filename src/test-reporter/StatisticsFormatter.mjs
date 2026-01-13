const Colors = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',

	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',

	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
};

export class StatisticsFormatter {
	#useColors = true;

	constructor(options = {}) {
		this.#useColors = options.useColors !== false;
	}

	format(aggregatedErrors) {
		const { errorsByFile, statistics } = aggregatedErrors;

		console.warn('\n' + this.#formatSeparator('='));
		console.warn(this.#formatHeader('Test Results Summary'));
		console.warn(this.#formatSeparator('=') + '\n');

		this.#formatOverallStatistics(statistics);

		if (statistics.failedTests > 0) {
			console.warn('\n' + this.#formatSeparator('-'));
			this.#formatErrorBreakdown(errorsByFile, aggregatedErrors);
		}

		console.warn('\n' + this.#formatSeparator('='));
	}

	#formatOverallStatistics(stats) {
		const statusColor = stats.failedTests === 0 ? Colors.green : Colors.red;
		const statusIcon = stats.failedTests === 0 ? '✅' : '❌';
		const statusText = stats.failedTests === 0 ? 'PASSED' : 'FAILED';

		console.warn(`${statusIcon} Status: ${this.#color(statusText, statusColor + Colors.bold)}\n`);

		console.warn(this.#color('Test Suites:', Colors.bold));
		console.warn(
			`  ${this.#color('●', Colors.green)} Passed: ${this.#color(stats.passedTestSuites, Colors.green)} / ${stats.totalTestSuites}`
		);
		if (stats.failedTestSuites > 0) {
			console.warn(
				`  ${this.#color('●', Colors.red)} Failed: ${this.#color(stats.failedTestSuites, Colors.red)} / ${stats.totalTestSuites}`
			);
		}

		console.warn(`\n${this.#color('Tests:', Colors.bold)}`);
		console.warn(
			`  ${this.#color('●', Colors.green)} Passed: ${this.#color(stats.passedTests, Colors.green)} / ${stats.totalTests}`
		);
		if (stats.failedTests > 0) {
			console.warn(
				`  ${this.#color('●', Colors.red)} Failed: ${this.#color(stats.failedTests, Colors.red)} / ${stats.totalTests}`
			);
		}
		if (stats.skippedTests > 0) {
			console.warn(
				`  ${this.#color('●', Colors.yellow)} Skipped: ${this.#color(stats.skippedTests, Colors.yellow)}`
			);
		}

		const successRateColor =
			stats.successRate >= 90 ? Colors.green : stats.successRate >= 70 ? Colors.yellow : Colors.red;

		console.warn(
			`\n${this.#color('Success Rate:', Colors.bold)} ${this.#color(stats.successRate + '%', successRateColor)}`
		);

		const durationFormatted = this.#formatDuration(stats.duration);
		console.warn(`${this.#color('Duration:', Colors.bold)} ${this.#color(durationFormatted, Colors.cyan)}`);
	}

	#formatErrorBreakdown(errorsByFile, aggregatedErrors) {
		console.warn(this.#color('\nFailure Breakdown', Colors.bold + Colors.red));
		console.warn(this.#formatSeparator('-'));

		this.#formatTopFailedFiles(errorsByFile);

		this.#formatErrorTypesDistribution(errorsByFile, aggregatedErrors);

		this.#formatSlowestFailures(errorsByFile, aggregatedErrors);

		if (errorsByFile.size <= 20) {
			this.#formatFailedFilesList(errorsByFile);
		}
	}

	#formatTopFailedFiles(errorsByFile) {
		const fileCounts = Array.from(errorsByFile.entries())
			.map(([file, failures]) => ({ file, count: failures.length }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		if (fileCounts.length > 0) {
			console.warn(`\n${this.#color('Top Failed Files:', Colors.yellow)}`);

			for (let i = 0; i < fileCounts.length; i++) {
				const { file, count } = fileCounts[i];
				const number = this.#color(`${i + 1}.`, Colors.dim);
				const countColor = count > 5 ? Colors.red : count > 2 ? Colors.yellow : Colors.white;

				console.warn(`  ${number} ${file} ${this.#color(`(${count} failures)`, countColor)}`);
			}
		}
	}

	#formatErrorTypesDistribution(errorsByFile, aggregatedErrors) {
		const errorTypes = new Map();

		for (const failures of errorsByFile.values()) {
			for (const failure of failures) {
				const type = this.#detectErrorType(failure);
				errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
			}
		}

		if (errorTypes.size > 0) {
			console.warn(`\n${this.#color('Error Types:', Colors.yellow)}`);

			const sortedTypes = Array.from(errorTypes.entries()).sort((a, b) => b[1] - a[1]);

			for (const [type, count] of sortedTypes) {
				const percentage = ((count / aggregatedErrors.statistics.failedTests) * 100).toFixed(1);
				console.warn(
					`  ${this.#color('●', this.#getErrorTypeColor(type))} ${type}: ${this.#color(count, Colors.bold)} ${this.#color(`(${percentage}%)`, Colors.dim)}`
				);
			}
		}
	}

	#formatSlowestFailures(errorsByFile) {
		const allFailures = [];
		for (const [file, failures] of errorsByFile.entries()) {
			for (const failure of failures) {
				allFailures.push({ file, failure });
			}
		}

		allFailures.sort((a, b) => b.failure.duration - a.failure.duration);
		const slowest = allFailures.slice(0, 5);

		if (slowest.length > 0) {
			console.warn(`\n${this.#color('Slowest Failures:', Colors.yellow)}`);

			for (let i = 0; i < slowest.length; i++) {
				const { file, failure } = slowest[i];
				const number = this.#color(`${i + 1}.`, Colors.dim);
				const duration = this.#color(this.#formatDuration(failure.duration), Colors.magenta);

				console.warn(`  ${number} ${failure.testName}`);
				console.warn(`     ${this.#color('File:', Colors.dim)} ${file}`);
				console.warn(`     ${this.#color('Duration:', Colors.dim)} ${duration}`);
			}
		}
	}

	#formatFailedFilesList(errorsByFile) {
		console.warn(`\n${this.#color('Failed Files:', Colors.yellow)}`);

		for (const [file, failures] of errorsByFile.entries()) {
			console.warn(`  ${this.#color('●', Colors.red)} ${file} ${this.#color(`(${failures.length})`, Colors.dim)}`);
		}
	}

	#detectErrorType(failure) {
		const allMessages = failure.failureMessages.join(' ').toLowerCase();

		if (allMessages.includes('timeout') || allMessages.includes('timed out')) {
			return 'Timeout';
		}
		if (
			allMessages.includes('assertion') ||
			allMessages.includes('expected') ||
			allMessages.includes('tobe') ||
			allMessages.includes('toequal')
		) {
			return 'Assertion';
		}
		if (allMessages.includes('unhandled') || allMessages.includes('rejection')) {
			return 'Unhandled Promise';
		}
		if (allMessages.includes('syntax') || allMessages.includes('unexpected token')) {
			return 'Syntax';
		}
		if (failure.snapshotDiff) {
			return 'Snapshot';
		}

		return 'Other';
	}

	#getErrorTypeColor(errorType) {
		const colorMap = {
			Timeout: Colors.red,
			Assertion: Colors.yellow,
			'Unhandled Promise': Colors.magenta,
			Syntax: Colors.red,
			Snapshot: Colors.cyan,
			Other: Colors.white,
		};

		return colorMap[errorType] || Colors.white;
	}

	#formatDuration(ms) {
		if (ms < 1000) {
			return `${ms}ms`;
		} else if (ms < 60000) {
			return `${(ms / 1000).toFixed(2)}s`;
		} else {
			const minutes = Math.floor(ms / 60000);
			const seconds = ((ms % 60000) / 1000).toFixed(0);
			return `${minutes}m ${seconds}s`;
		}
	}

	#formatHeader(text) {
		return this.#color(text, Colors.bold + Colors.cyan);
	}

	#formatSeparator(char = '-') {
		return this.#color(char.repeat(80), Colors.dim);
	}

	#color(text, colorCode) {
		if (!this.#useColors) {
			return String(text);
		}
		return `${colorCode}${text}${Colors.reset}`;
	}
}
