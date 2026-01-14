/**
 * Reporting facade - Clean Architecture entry point for reporting operations
 * Coordinates all reporting functionality through orchestration and analytics
 * @module reporters/ReportingFacade
 */

import type {
  ILogger,
  IWriter,
  Diagnostic,
  Result,
  DiagnosticStatistics,
} from '../core/index.js';
import { DiagnosticError, ok, err } from '../core/index.js';
import type { TestStatistics } from '../core/index.js';
import type { CollectionConfig } from '../domain/index.js';
import { ReportingOrchestrator } from './ReportingOrchestrator.js';

/**
 * Result structure for reporting facade operations
 * Contains aggregated diagnostics, statistics, and write status
 */
export interface FacadeResult {
  /** All collected diagnostics from all reporters */
  readonly diagnostics: readonly Diagnostic[];
  /** Test statistics snapshot */
  readonly testStats: TestStatistics;
  /** Diagnostic statistics snapshot */
  readonly diagnosticStats: DiagnosticStatistics;
  /** Whether diagnostics were successfully written */
  readonly written: boolean;
}

/**
 * Reporting facade - Clean Architecture boundary for reporting operations
 * Coordinates ReportingOrchestrator, analytics, and writers
 * Provides unified error handling through Result pattern
 */
export class ReportingFacade {
  private orchestrator: ReportingOrchestrator;

  /**
   * Create a new ReportingFacade instance
   * @param logger Logger service for diagnostics
   * @param writer Writer service for persisting diagnostics
   */
  public constructor(
    private readonly logger: ILogger,
    private readonly writer: IWriter<readonly Diagnostic[]>
  ) {
    this.orchestrator = new ReportingOrchestrator(logger);
  }

  /**
   * Execute complete reporting workflow
   * Collects from all reporters, aggregates statistics, and writes results
   * @param config Collection configuration
   * @returns Result with complete facade result or error
   */
  public async execute(config: CollectionConfig): Promise<Result<FacadeResult, DiagnosticError>> {
    try {
      // Run all reporters through orchestrator
      if (config.eslint) {
        await this.orchestrator.runEslint(config.patterns as string[], undefined);
      }
      
      if (config.typescript) {
        await this.orchestrator.runTypeScript(config.configPath || 'tsconfig.json');
      }
      
      this.orchestrator.initVitestReporter();

      // Get aggregated results from orchestrator
      const orchestrationResult = this.orchestrator.getResults();

      // Extract diagnostics and test results
      const diagnostics = orchestrationResult.diagnostics.diagnostics;
      const diagnosticStats = orchestrationResult.diagnostics.statistics;
      const testStats = orchestrationResult.tests.statistics;

      // Write diagnostics to file/stream
      let written = false;
      const writeResult = await this.writer.write(diagnostics);

      if (writeResult.isOk()) {
        written = true;
        this.logger.info('Diagnostics written successfully', {
          diagnosticCount: diagnostics.length,
        });
      } else {
        // Log write error but don't fail the operation
        this.logger.error('Failed to write diagnostics', {
          error: writeResult.error,
        });
      }

      // Return complete facade result with immutable snapshots
      return ok({
        diagnostics: Object.freeze([...diagnostics]),
        testStats: Object.freeze({ ...testStats }),
        diagnosticStats: Object.freeze({ ...diagnosticStats }),
        written,
      });
    } catch (error) {
      return err(
        new DiagnosticError(
          'Reporting facade execution failed',
          {
            patterns: config.patterns.join(', '),
            configPath: config.configPath || 'none',
          },
          error instanceof Error ? error : undefined
        )
      );
    }
  }

  /**
   * Reset all reporters and analytics to clean state
   */
  public reset(): void {
    this.orchestrator.reset();
    this.logger.debug('Reporting facade reset');
  }
}
