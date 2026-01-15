/**
 * Mock implementation of ILogger for testing
 * @module tests/mocks/MockLogger
 */

import type { ILogger, LogContext } from '../../src/core/contracts/index.js';

export class MockLogger implements ILogger {
  private logs: { level: string; message: string; context?: LogContext }[] = [];

  debug(message: string, context?: LogContext): void {
    this.logs.push({ level: 'debug', message, context });
  }

  info(message: string, context?: LogContext): void {
    this.logs.push({ level: 'info', message, context });
  }

  warn(message: string, context?: LogContext): void {
    this.logs.push({ level: 'warn', message, context });
  }

  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    this.logs.push({ level: 'error', message, context: error as LogContext | undefined });
  }

  child(context: LogContext): ILogger {
    return new MockLogger();
  }

  getLogs(): { level: string; message: string; context?: LogContext }[] {
    return this.logs;
  }

  clear(): void {
    this.logs = [];
  }

  getLogsByLevel(level: string): { level: string; message: string; context?: LogContext }[] {
    return this.logs.filter((log) => log.level === level);
  }
}
