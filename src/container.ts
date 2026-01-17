/**
 * Dependency injection container setup using inversify
 * @module container
 */

import 'reflect-metadata';
import { Container } from 'inversify';

// Infrastructure - Logging
import { type ILogger ,type  IFileSystem ,type  IPathService ,type  ISanitizer } from './core/index.js';
import { TOKENS } from './diTokens.js';
import { DiagnosticAggregator } from './domain/analytics/diagnostics/DiagnosticAggregator.js';
import { DiagnosticAnalytics } from './domain/analytics/diagnostics/DiagnosticAnalytics.js';
import { DiagnosticMetadataBuilder } from './domain/analytics/diagnostics/DiagnosticMetadataBuilder.js';
import { TypeScriptAnalytics } from './domain/analytics/typescript/TypeScriptAnalytics.js';
import { FileReportAssembler } from './domain/mappers/FileReportAssembler.js';
import { SourceCodeEnricher } from './domain/mappers/SourceCodeEnricher.js';
import { ConfigValidator } from './domain/validation/ConfigValidator.js';
import { DirectoryService } from './infrastructure/filesystem/DirectoryService.js';
import { FileContentReader } from './infrastructure/filesystem/FileContentReader.js';
import { FileWriter } from './infrastructure/filesystem/FileWriter.js';
import { JsonWriter } from './infrastructure/filesystem/JsonWriter.js';
import { NodeFileSystem } from './infrastructure/filesystem/NodeFileSystem.js';
import { StreamWriter } from './infrastructure/filesystem/StreamWriter.js';
import { StructuredReportWriter } from './infrastructure/filesystem/StructuredReportWriter.js';
import { ConsoleFormatter } from './infrastructure/formatting/ConsoleFormatter.js';
import { JsonFormatter } from './infrastructure/formatting/JsonFormatter.js';
import { TableFormatter } from './infrastructure/formatting/TableFormatter.js';
import { ConsoleLogger } from './infrastructure/logging/ConsoleLogger.js';
import { PinoLogger } from './infrastructure/logging/PinoLogger.js';
import { UpathService } from './infrastructure/paths/UpathService.js';
import { PathValidator } from './infrastructure/security/PathValidator.js';
import { RedactSanitizer } from './infrastructure/security/RedactSanitizer.js';
import { EslintAdapter } from './reporters/eslint/EslintAdapter.js';
import { ReportingFacade } from './reporters/ReportingFacade.js';
import { ReportingOrchestrator } from './reporters/ReportingOrchestrator.js';
import { TypeScriptAdapter } from './reporters/typescript/TypeScriptAdapter.js';
import { VitestAdapter } from './reporters/vitest/VitestAdapter.js';


// Infrastructure - FileSystem


// Infrastructure - Paths


// Infrastructure - Security


// Infrastructure - Formatting

// Domain - Analytics

// Domain - Validation

// Reporters

// Domain - Analytics (diagnostics collector)

// Application - Use Cases
// Application - Use Cases
// (use-cases are constructed by the application layer at runtime; do not import here to avoid unused bindings)

// Define dependency injection tokens
// TOKENS moved to src/diTokens.ts to avoid circular imports

let containerInstance: Container | null = null;

/**
 * Setup the dependency injection container
 * @returns Configured inversify container
 */
export function setupContainer(): Container {
  const container = new Container({ defaultScope: 'Singleton' });

  // Register Logger as singleton (use factory to avoid constructor metadata issues)
    container
      .bind<ILogger>(TOKENS.Logger)
      .toDynamicValue(() => new PinoLogger())
      .inSingletonScope();
  // Also provide a ConsoleLogger as an alternative singleton implementation
  container.bind<ILogger>(TOKENS.ConsoleLogger).to(ConsoleLogger).inSingletonScope();

  // Register FileSystem as singleton
  container.bind<IFileSystem>(TOKENS.FileSystem).to(NodeFileSystem).inSingletonScope();

  // Register PathService as singleton
  container.bind<IPathService>(TOKENS.PathService).to(UpathService).inSingletonScope();

  // Register Sanitizer as singleton
  container.bind<ISanitizer>(TOKENS.Sanitizer).to(RedactSanitizer).inSingletonScope();

  // Register PathValidator as singleton
  container.bind(TOKENS.PathValidator).toDynamicValue(() => new PathValidator(container.get(TOKENS.PathService))).inSingletonScope();

  // Register DirectoryService as singleton
  container.bind(TOKENS.DirectoryService).toDynamicValue(() => new DirectoryService(container.get(TOKENS.FileSystem))).inSingletonScope();

  // Register Formatters
  container.bind(TOKENS.ConsoleFormatter).to(ConsoleFormatter).inTransientScope();
  container.bind(TOKENS.JsonFormatter).to(JsonFormatter).inTransientScope();
  container.bind(TOKENS.TableFormatter).to(TableFormatter).inTransientScope();

  // Register Writers as transient
  container.bind(TOKENS.JsonWriter).toDynamicValue(() => new JsonWriter(container.get(TOKENS.FileSystem), process.cwd())).inTransientScope();
  container.bind(TOKENS.StreamWriter).toDynamicValue(() => new StreamWriter(container.get(TOKENS.FileSystem), process.cwd())).inTransientScope();

  // Register DiagnosticAggregator as constant (it only has static methods)
  container.bind(TOKENS.DiagnosticAggregator).toConstantValue(DiagnosticAggregator);

  // Register ConfigValidator as singleton
  container.bind(TOKENS.ConfigValidator).to(ConfigValidator).inSingletonScope();

  // Register Reporters as transient with logger injection using factories
  container
    .bind(TOKENS.EslintAdapter)
    .toDynamicValue(() => new EslintAdapter(container.get(TOKENS.Logger)))
    .inTransientScope();

  container
    .bind(TOKENS.TypeScriptAdapter)
    .toDynamicValue(() => new TypeScriptAdapter(container.get(TOKENS.Logger)))
    .inTransientScope();

  container
    .bind(TOKENS.VitestAdapter)
    .toDynamicValue(() => new VitestAdapter(container.get(TOKENS.Logger)))
    .inTransientScope();

  // Register analytics collectors as transient
  container.bind(TOKENS.TypeScriptAnalytics).to(TypeScriptAnalytics).inTransientScope();
  // DiagnosticAnalytics used by the orchestrator - provide instance as constant
  container.bind(TOKENS.DiagnosticAnalytics).toConstantValue(new DiagnosticAnalytics());

  // Register file content reader
  container.bind(TOKENS.FileContentReader).to(FileContentReader).inTransientScope();

  // Register diagnostic metadata builder as constant (stateless)
  container.bind(TOKENS.DiagnosticMetadataBuilder).toConstantValue(DiagnosticMetadataBuilder);

  // Register file report assembler as constant (stateless)
  container.bind(TOKENS.FileReportAssembler).toConstantValue(FileReportAssembler);

  // Register source code enricher
  // Construct SourceCodeEnricher via factory to avoid relying on constructor metadata
  container
    .bind(TOKENS.SourceCodeEnricher)
    .toDynamicValue(() => new SourceCodeEnricher(container.get(TOKENS.FileContentReader)))
    .inTransientScope();

  // Register structured report writer via factory to avoid relying on interface metadata
  container
    .bind(TOKENS.StructuredReportWriter)
    .toDynamicValue(() =>
      new StructuredReportWriter(
        container.get(TOKENS.FileSystem),
        container.get(TOKENS.PathService),
        container.get(TOKENS.DirectoryService),
        container.get(TOKENS.Logger)
      )
    )
    .inTransientScope();

  // Use-cases require runtime parameters (sources, writers) and are
  // created by the application layer (CLI handlers). Do not bind them
  // here to avoid accidental construction with incorrect dependencies.

  // Register orchestrator and facade
  container.bind(TOKENS.ReportingOrchestrator).to(ReportingOrchestrator).inTransientScope();
  // FileWriter requires basePath primitive - provide a default via factory
  container.bind(TOKENS.FileWriter).toDynamicValue(() => new FileWriter(process.cwd())).inTransientScope();
  container.bind(TOKENS.ReportingFacade).to(ReportingFacade).inSingletonScope();
  // Also bind class identifier for tests that request the class directly
  container.bind(ReportingFacade).to(ReportingFacade).inSingletonScope();

  return container;
}

/**
 * Get or create the global container instance
 * @returns Global inversify container
 */
export function getContainer(): Container {
  // Use nullish coalescing assignment for brevity and clarity
  containerInstance ??= setupContainer();
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetContainer(): void {
  containerInstance = null;
}
