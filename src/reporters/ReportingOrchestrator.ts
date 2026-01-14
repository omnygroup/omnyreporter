/**
 * Reporting orchestrator - coordinates all reporters
 * Aggregates results from ESLint, TypeScript, and Vitest
 * @module reporters/ReportingOrchestrator
 */

import { injectable, inject } from 'inversify';
import type { ILogger, DiagnosticStatistics, TestStatistics } from '../core/index.js';
import { DiagnosticAnalytics } from '../domain/analytics/diagnostics/DiagnosticAnalytics.js';
import { EslintAdapter } from './eslint/EslintAdapter.js';
import { TypeScriptAdapter } from './typescript/TypeScriptAdapter.js';
import { VitestAdapter } from './vitest/VitestAdapter.js';
import { TOKENS } from '../container.js';
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
@injectable()
export class ReportingOrchestrator {
  /** ESLint adapter */
  private readonly eslintAdapter: EslintAdapter;
  /** TypeScript adapter */
  private readonly typescriptAdapter: TypeScriptAdapter;
  /** Vitest adapter */
  private readonly vitestAdapter: VitestAdapter;
  /** Diagnostic analytics collector */
  private readonly diagnosticAnalytics: DiagnosticAnalytics;

  /**
   * Create a new ReportingOrchestrator instance (dependencies injected)
   */
  public constructor(
    @inject(TOKENS.Logger) private readonly logger: ILogger,
    @inject(TOKENS.EslintAdapter) eslintAdapter: EslintAdapter,
    @inject(TOKENS.TypeScriptAdapter) typescriptAdapter: TypeScriptAdapter,
    @inject(TOKENS.VitestAdapter) vitestAdapter: VitestAdapter,
    @inject(TOKENS.DiagnosticAnalytics) diagnosticAnalytics: DiagnosticAnalytics
  ) {
    this.eslintAdapter = eslintAdapter;
    this.typescriptAdapter = typescriptAdapter;
    this.vitestAdapter = vitestAdapter;
    this.diagnosticAnalytics = diagnosticAnalytics;
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
