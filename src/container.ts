/**
 * Dependency injection container setup using inversify
 * @module container
 */

import 'reflect-metadata';
import { Container } from 'inversify';

// Infrastructure - Logging
import { PinoLogger } from './infrastructure/logging/PinoLogger.js';
import type { ILogger } from './core/index.js';

// Infrastructure - FileSystem
import { NodeFileSystem } from './infrastructure/filesystem/NodeFileSystem.js';
import { DirectoryService } from './infrastructure/filesystem/DirectoryService.js';
import { JsonWriter } from './infrastructure/filesystem/JsonWriter.js';
import { StreamWriter } from './infrastructure/filesystem/StreamWriter.js';
import type { IFileSystem } from './core/index.js';

// Infrastructure - Paths
import { UpathService } from './infrastructure/paths/UpathService.js';
import type { IPathService } from './core/index.js';

// Infrastructure - Security
import { RedactSanitizer } from './infrastructure/security/RedactSanitizer.js';
import { PathValidator } from './infrastructure/security/PathValidator.js';
import type { ISanitizer } from './core/index.js';

// Infrastructure - Formatting
import { ConsoleFormatter } from './infrastructure/formatting/ConsoleFormatter.js';
import { JsonFormatter } from './infrastructure/formatting/JsonFormatter.js';
import { TableFormatter } from './infrastructure/formatting/TableFormatter.js';

// Domain - Analytics
import { DiagnosticAggregator } from './domain/analytics/diagnostics/DiagnosticAggregator.js';

// Domain - Validation
import { ConfigValidator } from './domain/validation/ConfigValidator.js';

// Reporters
import { EslintAdapter } from './reporters/eslint/EslintAdapter.js';
import { TypeScriptAdapter } from './reporters/typescript/TypeScriptAdapter.js';

// Application - Use Cases
import { CollectDiagnosticsUseCase } from './application/usecases/CollectDiagnostics.js';
import { GenerateReportUseCase } from './application/usecases/GenerateReport.js';

// Define dependency injection tokens
export const TOKENS = {
  // Logger
  Logger: Symbol.for('ILogger'),
  
  // FileSystem
  FileSystem: Symbol.for('IFileSystem'),
  DirectoryService: Symbol.for('DirectoryService'),
  JsonWriter: Symbol.for('JsonWriter'),
  StreamWriter: Symbol.for('StreamWriter'),
  
  // Paths
  PathService: Symbol.for('IPathService'),
  
  // Security
  Sanitizer: Symbol.for('ISanitizer'),
  PathValidator: Symbol.for('PathValidator'),
  
  // Formatting
  ConsoleFormatter: Symbol.for('ConsoleFormatter'),
  JsonFormatter: Symbol.for('JsonFormatter'),
  TableFormatter: Symbol.for('TableFormatter'),
  
  // Domain
  DiagnosticAggregator: Symbol.for('DiagnosticAggregator'),
  ConfigValidator: Symbol.for('ConfigValidator'),
  
  // Reporters
  EslintAdapter: Symbol.for('EslintAdapter'),
  TypeScriptAdapter: Symbol.for('TypeScriptAdapter'),
  
  // Use Cases
  CollectDiagnosticsUseCase: Symbol.for('CollectDiagnosticsUseCase'),
  GenerateReportUseCase: Symbol.for('GenerateReportUseCase'),
} as const;

let containerInstance: Container | null = null;

/**
 * Setup the dependency injection container
 * @returns Configured inversify container
 */
export function setupContainer(): Container {
  const container = new Container({ defaultScope: 'Singleton' });

  // Register Logger as singleton
  container.bind<ILogger>(TOKENS.Logger).to(PinoLogger).inSingletonScope();

  // Register FileSystem as singleton
  container.bind<IFileSystem>(TOKENS.FileSystem).to(NodeFileSystem).inSingletonScope();

  // Register PathService as singleton
  container.bind<IPathService>(TOKENS.PathService).to(UpathService).inSingletonScope();

  // Register Sanitizer as singleton
  container.bind<ISanitizer>(TOKENS.Sanitizer).to(RedactSanitizer).inSingletonScope();

  // Register PathValidator as singleton
  container.bind(TOKENS.PathValidator).to(PathValidator).inSingletonScope();

  // Register DirectoryService as singleton
  container.bind(TOKENS.DirectoryService).to(DirectoryService).inSingletonScope();

  // Register Formatters
  container.bind(TOKENS.ConsoleFormatter).to(ConsoleFormatter).inTransientScope();
  container.bind(TOKENS.JsonFormatter).to(JsonFormatter).inTransientScope();
  container.bind(TOKENS.TableFormatter).to(TableFormatter).inTransientScope();

  // Register Writers as transient
  container.bind(TOKENS.JsonWriter).to(JsonWriter).inTransientScope();
  container.bind(TOKENS.StreamWriter).to(StreamWriter).inTransientScope();

  // Register DiagnosticAggregator as constant (it only has static methods)
  container.bind(TOKENS.DiagnosticAggregator).toConstantValue(DiagnosticAggregator);

  // Register ConfigValidator as singleton
  container.bind(TOKENS.ConfigValidator).to(ConfigValidator).inSingletonScope();

  // Register Reporters as transient with logger injection
  container
    .bind(TOKENS.EslintAdapter)
    .to(EslintAdapter)
    .inTransientScope();

  container
    .bind(TOKENS.TypeScriptAdapter)
    .to(TypeScriptAdapter)
    .inTransientScope();

  // Register Use Cases as transient
  // These would need proper configuration based on available sources
  // For now, we'll configure them in the CLI handler
  container
    .bind(TOKENS.CollectDiagnosticsUseCase)
    .to(CollectDiagnosticsUseCase)
    .inTransientScope();

  container
    .bind(TOKENS.GenerateReportUseCase)
    .to(GenerateReportUseCase)
    .inTransientScope();

  return container;
}

/**
 * Get or create the global container instance
 * @returns Global inversify container
 */
export function getContainer(): Container {
  if (!containerInstance) {
    containerInstance = setupContainer();
  }
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetContainer(): void {
  containerInstance = null;
}
