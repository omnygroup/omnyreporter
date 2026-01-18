/**
 * Analytics module barrel export
 * @module domain/analytics
 */

export { DiagnosticAnalytics } from './diagnostics/index.js';
export { TestAnalytics, TestStatisticsCalculator } from './tests/index.js';
export { LintAnalytics, LintStatisticsCalculator, type LintStatistics } from './lint/index.js';
export { TypeScriptAnalytics, TypeScriptStatisticsCalculator, type TypeScriptStatistics } from './typescript/index.js';
