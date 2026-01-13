/**
 * Test error reporter entry point
 * Orchestrates test execution, parsing, enrichment, and reporting
 * @module parse-tests
 */

import { DiagnosticsEnricher } from './src/test-reporter/DiagnosticsEnricher.mjs';
import { ErrorAggregator } from './src/test-reporter/ErrorAggregator.mjs';
import { FileSystemWriter } from './src/test-reporter/FileSystemWriter.mjs';
import { JsonResultsParser } from './src/test-reporter/JsonResultsParser.mjs';
import { StatisticsFormatter } from './src/test-reporter/StatisticsFormatter.mjs';
import { VitestExecutor } from './src/test-reporter/VitestExecutor.mjs';

/**
 * Main execution pipeline
 */
const SEPARATOR = '─────────────────────────────';

async function main() {
	console.warn('🚀 Starting test error reporter...\n');

	const startTime = Date.now();
	let executor = null;

	try {
		// Phase 1: Execute tests
		console.warn('Phase 1/6: Executing tests');
		console.warn(SEPARATOR);
		console.warn('');

		executor = new VitestExecutor();
		const executionResult = await executor.execute();

		// Phase 2: Parse JSON results
		console.warn('\nPhase 2/6: Parsing test results');
		console.warn(SEPARATOR);
		console.warn('');

		const parser = new JsonResultsParser();
		const testResults = parser.parse(executionResult.outputFilePath);

		// Phase 3: Enrich diagnostics
		console.warn('\nPhase 3/6: Enriching diagnostics');
		console.warn(SEPARATOR);
		console.warn('');

		const enricher = new DiagnosticsEnricher();
		const enrichedResults = enricher.enrich(testResults);

		// Phase 4: Aggregate errors
		console.warn('\nPhase 4/6: Aggregating errors');
		console.warn(SEPARATOR);
		console.warn('');

		const aggregator = new ErrorAggregator();
		const aggregatedErrors = aggregator.aggregate(enrichedResults);

		// Phase 5: Write to file system
		console.warn('\nPhase 5/6: Writing error reports');
		console.warn(SEPARATOR);
		console.warn('');

		const writer = new FileSystemWriter();
		await writer.write(aggregatedErrors);

		// Phase 6: Display statistics
		console.warn('\nPhase 6/6: Formatting statistics');
		console.warn(SEPARATOR);
		console.warn('');

		const formatter = new StatisticsFormatter();
		formatter.format(aggregatedErrors);

		// Cleanup
		executor.cleanup();

		// Final summary
		const totalTime = Date.now() - startTime;
		console.warn(`\n⏱️  Total processing time: ${totalTime}ms`);

		if (aggregatedErrors.statistics.failedTests > 0) {
			console.warn(`\n📁 Error reports saved to: ${writer.getOutputDir()}/`);
			console.warn(
				`   ${aggregatedErrors.errorsByFile.size} file(s) with ${aggregatedErrors.statistics.failedTests} failure(s)`
			);
		}

		console.warn('\n✅ Test error reporting completed successfully\n');

		// Always exit with 0 to allow error capture without blocking workflows
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Fatal error during test error reporting:');
		console.error(`   ${error.message}`);

		if (error.stack) {
			console.error('\nStack trace:');
			console.error(error.stack);
		}

		// Cleanup on error
		if (executor) {
			try {
				executor.cleanup();
			} catch (cleanupError) {
				console.warn(`⚠️  Cleanup warning: ${cleanupError.message}`);
			}
		}

		// Exit with code 2 for script errors (not test failures)
		process.exit(2);
	}
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
	console.error('\n❌ Unhandled Promise Rejection:');
	console.error(reason);
	process.exit(2);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	console.error('\n❌ Uncaught Exception:');
	console.error(error);
	process.exit(2);
});

// Run the main pipeline
main();
