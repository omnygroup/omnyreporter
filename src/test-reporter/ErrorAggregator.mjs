import { PathNormalizer } from './PathNormalizer.mjs';

export class ErrorAggregator {
	#pathNormalizer;

	constructor() {
		this.#pathNormalizer = new PathNormalizer();
	}

	aggregate(enrichedResults) {
		console.warn('📊 Aggregating test errors by file...');

		const errorsByFile = new Map();

		for (const result of enrichedResults) {
			const normalizedPath = this.#pathNormalizer.normalize(result.testFile);

			if (!errorsByFile.has(normalizedPath)) {
				errorsByFile.set(normalizedPath, []);
			}

			const fileErrors = errorsByFile.get(normalizedPath);
			if (fileErrors) {
				fileErrors.push(...result.failures);
			}
		}

		for (const [, failures] of errorsByFile.entries()) {
			failures.sort((a, b) => b.duration - a.duration);
		}

		const failedCount = Array.from(errorsByFile.values()).reduce((sum, failures) => sum + failures.length, 0);

		console.warn(`✅ Aggregated ${String(failedCount)} failures across ${String(errorsByFile.size)} files`);

		return {
			errorsByFile,
			statistics: { failedTests: failedCount },
		};
	}
}
