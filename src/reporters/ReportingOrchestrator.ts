/**
 * Reporting orchestrator - coordinates all reporters
 * Aggregates results from ESLint, TypeScript, and Vitest
 * @module reporters/ReportingOrchestrator
 */

import type { ILogger, DiagnosticStatistics, TestStatistics } from '../core/index.js';
import { DiagnosticAnalytics } from '../domain/analytics/diagnostics/DiagnosticAnalytics.js';
import { EslintAdapter } from './eslint/EslintAdapter.js';
import { TypeScriptAdapter } from './typescript/TypeScriptAdapter.js';
import { VitestAdapter } from './vitest/VitestAdapter.js';
import type { Diagnostic } from '../core/index.js';
import type { TestResult } from './vitest/TaskProcessor.js';

/**
 * Result of orchestrated reporting
 * Contains aggregated statistics from all reporters
 */
export interface OrchestrationResult {
  readonly diagnostics: {
    readonly statistics: DiagnosticStatistics;
    readonly diagnostics: readonly Diagnostic[];
  };
  readonly tests: {
    readonly statistics: TestStatistics;
    readonly results: readonly TestResult[];
  };
  readonly timestamp: Date;
}

/**
 * Orchestrates diagnostic and test reporting
 * Coordinates ESLint, TypeScript, and Vitest adapters
 * Aggregates results and provides unified statistics
 */
export class ReportingOrchestrator {
  private eslintAdapter: EslintAdapter;
  private typescriptAdapter: TypeScriptAdapter;
  private vitestAdapter: VitestAdapter;
  private diagnosticAnalytics: DiagnosticAnalytics;

  /**
   * Create a new ReportingOrchestrator instance
   * @param logger Logger service for all adapters
   */
  public constructor(private readonly logger: ILogger) {
    this.eslintAdapter = new EslintAdapter(logger);
    this.typescriptAdapter = new TypeScriptAdapter(logger);
    this.vitestAdapter = new VitestAdapter(logger);
    this.diagnosticAnalytics = new DiagnosticAnalytics();
  }

  /**
   * Run ESLint analysis
   * @param patterns Glob patterns for files
   * @param configPath Optional path to eslint config
   * @returns Result of ESLint analysis
   */
  public async runEslint(
    patterns: readonly string[],
    configPath?: string
  ): Promise<readonly Diagnostic[]> {
    try {
      const diagnostics = await this.eslintAdapter.lint(patterns, configPath);
      diagnostics.forEach((diagnostic) => {
        this.diagnosticAnalytics.collect(diagnostic);
      });
      return diagnostics;
    } catch (error) {
      this.logger.error('ESLint analysis failed', { error });
      throw error;
    }
  }

  /**
   * Run TypeScript diagnostics
   * @param tsConfigPath Path to tsconfig.json
   * @returns Result of TypeScript analysis
   */
  public async runTypeScript(tsConfigPath: string): Promise<readonly Diagnostic[]> {
    try {
      const diagnostics = await this.typescriptAdapter.check(tsConfigPath);
      diagnostics.forEach((diagnostic) => {
        this.diagnosticAnalytics.collect(diagnostic);
      });
      return diagnostics;
    } catch (error) {
      this.logger.error('TypeScript analysis failed', { error });
      throw error;
    }
  }

  /**
   * Initialize Vitest reporter
   * Called at test run start
   */
  public initVitestReporter(): void {
    this.vitestAdapter.onInit();
  }

  /**
   * Handle Vitest module completion
   * @param files Array of test file objects
   */
  public onVitestModuleEnd(files: unknown[]): void {
    this.vitestAdapter.onTestModuleEnd(files);
  }

  /**
   * Handle Vitest run completion
   * Called at test run end
   */
  public onVitestRunEnd(): void {
    this.vitestAdapter.onTestRunEnd();
  }

  /**
   * Get aggregated reporting results
   * Combines diagnostics and test statistics
   * @returns Orchestration result with all statistics
   */
  public getResults(): OrchestrationResult {
    return {
      diagnostics: {
        statistics: this.diagnosticAnalytics.getSnapshot(),
        diagnostics: this.diagnosticAnalytics.getDiagnostics(),
      },
      tests: {
        statistics: this.vitestAdapter.getTestStatistics(),
        results: this.vitestAdapter.getTestResults(),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Reset all reporters and analytics
   */
  public reset(): void {
    this.diagnosticAnalytics.reset();
    this.vitestAdapter.reset();
  }
}
