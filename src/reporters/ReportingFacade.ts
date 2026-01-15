/**
 * Reporting facade - Clean Architecture entry point for reporting operations
 * Coordinates all reporting functionality through orchestration and analytics
 * @module reporters/ReportingFacade
 */

import { injectable, inject } from 'inversify';

import { DiagnosticError, ok, err ,type 
  ILogger,type 
  IWriter,type 
  Diagnostic,type 
  Result,type 
  DiagnosticStatistics,
,type  TestStatistics } from '../core/index.js';
import type { CollectionConfig } from '../domain/index.js';

import { ReportingOrchestrator } from './ReportingOrchestrator.js';

import { TOKENS } from '../diTokens.js';

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
 * Result structure for TypeScript/ESLint diagnostics
 */
export interface DiagnosticsResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly summary: {
    readonly totalErrors: number;
    readonly totalWarnings: number;
    readonly filesAnalyzed: number;
  };
}

/**
 * Reporting facade - Clean Architecture boundary for reporting operations
 * Coordinates ReportingOrchestrator, analytics, and writers
 * Provides unified error handling through Result pattern
 */
@injectable()
export class ReportingFacade {
  private readonly orchestrator: ReportingOrchestrator;
  private readonly logger: ILogger;
  private readonly writer: IWriter<readonly Diagnostic[]>;

  /**
   * Create a new ReportingFacade instance (dependencies injected)
   * @param orchestrator Orchestrator coordinating reporters
   * @param logger Logger implementation
   * @param writer Writer implementation for diagnostics
   */
  public constructor(
    @inject(TOKENS.ReportingOrchestrator) orchestrator: ReportingOrchestrator,
    @inject(TOKENS.Logger) logger: ILogger,
    @inject(TOKENS.FileWriter) writer: IWriter<readonly Diagnostic[]>
  ) {
    this.orchestrator = orchestrator;
    this.logger = logger;
    this.writer = writer;
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
        await this.orchestrator.runEslint(config.patterns, undefined);
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
   * Collect TypeScript diagnostics
   * @param config Collection configuration
   * @returns Diagnostics result with TypeScript issues
   */
  public async collectTypeScriptDiagnostics(_config: { timeout?: number }): Promise<{ result: DiagnosticsResult }> {
    try {
      this.orchestrator.reset();
      await this.orchestrator.runTypeScript('tsconfig.json');
      const result = this.orchestrator.getResults();
      const diagnostics = result.diagnostics.diagnostics.filter(d => d.source === 'typescript');
      
      return {
        result: {
          diagnostics,
          summary: {
            totalErrors: result.diagnostics.statistics.errorCount,
            totalWarnings: result.diagnostics.statistics.warningCount,
            filesAnalyzed: Object.keys(result.diagnostics.statistics.totalByFile).length,
          },
        },
      };
    } catch (error) {
      this.logger.error('TypeScript collection failed', { error });
      return {
        result: {
          diagnostics: [],
          summary: { totalErrors: 0, totalWarnings: 0, filesAnalyzed: 0 },
        },
      };
    }
  }

  /**
   * Collect ESLint diagnostics
   * @param config Collection configuration
   * @returns Diagnostics result with ESLint issues
   */
  public async collectEslintDiagnostics(config: { patterns?: string[]; timeout?: number }): Promise<{ result: DiagnosticsResult }> {
    try {
      const patterns = config.patterns || ['src'];
      this.orchestrator.reset();
      await this.orchestrator.runEslint(patterns, undefined);
      const result = this.orchestrator.getResults();
      const diagnostics = result.diagnostics.diagnostics.filter(d => d.source === 'eslint');
      
      return {
        result: {
          diagnostics,
          summary: {
            totalErrors: result.diagnostics.statistics.errorCount,
            totalWarnings: result.diagnostics.statistics.warningCount,
            filesAnalyzed: Object.keys(result.diagnostics.statistics.totalByFile).length,
          },
        },
      };
    } catch (error) {
      this.logger.error('ESLint collection failed', { error });
      return {
        result: {
          diagnostics: [],
          summary: { totalErrors: 0, totalWarnings: 0, filesAnalyzed: 0 },
        },
      };
    }
  }

  /**
   * Collect all diagnostics (ESLint and TypeScript)
   * @param config Collection configuration
   * @returns Combined diagnostics result
   */
  public async collectAll(/* config?: { timeout?: number } */): Promise<{ result: DiagnosticsResult }> {
    try {
      this.orchestrator.reset();
      await this.orchestrator.runEslint(['src'], undefined);
      await this.orchestrator.runTypeScript('tsconfig.json');
      const result = this.orchestrator.getResults();
      
      return {
        result: {
          diagnostics: result.diagnostics.diagnostics,
          summary: {
            totalErrors: result.diagnostics.statistics.errorCount,
            totalWarnings: result.diagnostics.statistics.warningCount,
            filesAnalyzed: Object.keys(result.diagnostics.statistics.totalByFile).length,
          },
        },
      };
    } catch (error) {
      this.logger.error('Collection failed', { error });
      return {
        result: {
          diagnostics: [],
          summary: { totalErrors: 0, totalWarnings: 0, filesAnalyzed: 0 },
        },
      };
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
