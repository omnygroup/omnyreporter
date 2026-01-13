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
async function main() {
	console.log('🚀 Starting test error reporter...\n');

	const startTime = Date.now();
	let executor = null;

	try {
		// Phase 1: Execute tests
		console.log('Phase 1/6: Executing tests');
		console.log('─────────────────────────────\n');

		executor = new VitestExecutor();
		const executionResult = await executor.execute();

		// Phase 2: Parse JSON results
		console.log('\nPhase 2/6: Parsing test results');
		console.log('─────────────────────────────\n');

		const parser = new JsonResultsParser();
		const testResults = parser.parse(executionResult.outputFilePath);

		// Phase 3: Enrich diagnostics
		console.log('\nPhase 3/6: Enriching diagnostics');
		console.log('─────────────────────────────\n');

		const enricher = new DiagnosticsEnricher();
		const enrichedResults = enricher.enrich(testResults);

		// Phase 4: Aggregate errors
		console.log('\nPhase 4/6: Aggregating errors');
		console.log('─────────────────────────────\n');

		const aggregator = new ErrorAggregator();
		const aggregatedErrors = aggregator.aggregate(enrichedResults);

		// Phase 5: Write to file system
		console.log('\nPhase 5/6: Writing error reports');
		console.log('─────────────────────────────\n');

		const writer = new FileSystemWriter();
		await writer.write(aggregatedErrors);

		// Phase 6: Display statistics
		console.log('\nPhase 6/6: Formatting statistics');
		console.log('─────────────────────────────\n');

		const formatter = new StatisticsFormatter();
		formatter.format(aggregatedErrors);

		// Cleanup
		executor.cleanup();

		// Final summary
		const totalTime = Date.now() - startTime;
		console.log(`\n⏱️  Total processing time: ${totalTime}ms`);

		if (aggregatedErrors.statistics.failedTests > 0) {
			console.log(`\n📁 Error reports saved to: ${writer.getOutputDir()}/`);
			console.log(
				`   ${aggregatedErrors.errorsByFile.size} file(s) with ${aggregatedErrors.statistics.failedTests} failure(s)`
			);
		}

		console.log('\n✅ Test error reporting completed successfully\n');

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
process.on('unhandledRejection', () => {
	console.error('\n❌ Unhandled Promise Rejection:');
	console.error(_reason);
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
