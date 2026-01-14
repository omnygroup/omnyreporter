/**
 * @module tests/mocks
 * Mock implementations of core contracts for testing
 */

export { MockLogger } from './MockLogger.js';
export { MockFileSystem } from './MockFileSystem.js';
export { MockDiagnosticSource } from './MockDiagnosticSource.js';
export { MockWriter } from './MockWriter.js';
export { MockFormatter } from './MockFormatter.js';
export { createTestDiagnostic, createTestStatistics, createTestDiagnostics } from './factory.js';
