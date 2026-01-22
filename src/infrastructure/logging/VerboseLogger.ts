/**
 * Verbose logger wrapper - proxies stdout/stderr when enabled
 * Useful for debugging tool execution (eslint, tsc, vitest)
 * @module infrastructure/logging/VerboseLogger
 */

import type { ILogger } from '../../core/index.js';

/**
 * Logger that optionally proxies stdout/stderr to the underlying logger
 * Enables seeing actual tool output during verbose mode
 */
export class VerboseLogger implements ILogger {
  private originalStdoutWrite: typeof process.stdout.write;
  private originalStderrWrite: typeof process.stderr.write;

  public constructor(
    private readonly underlying: ILogger,
    private readonly verbose = false
  ) {
    this.originalStdoutWrite = process.stdout.write.bind(process.stdout);
    this.originalStderrWrite = process.stderr.write.bind(process.stderr);

    if (this.verbose) {
      this.setupProxying();
    }
  }

  /**
   * Setup stdout/stderr proxying to the underlying logger
   */
  private setupProxying(): void {
    // Proxy stdout to info level
    process.stdout.write = ((chunk: string | Buffer): boolean => {
      const text = typeof chunk === 'string' ? chunk : chunk.toString();
      const trimmed = text.trim();
      if (trimmed.length > 0) {
        this.underlying.debug(`[stdout] ${trimmed}`);
      }
      return true;
    }) as typeof process.stdout.write;

    // Proxy stderr to warn level
    process.stderr.write = ((chunk: string | Buffer): boolean => {
      const text = typeof chunk === 'string' ? chunk : chunk.toString();
      const trimmed = text.trim();
      if (trimmed.length > 0) {
        this.underlying.warn(`[stderr] ${trimmed}`);
      }
      return true;
    }) as typeof process.stderr.write;
  }

  /**
   * Restore original stdout/stderr
   */
  public restore(): void {
    if (this.verbose) {
      process.stdout.write = this.originalStdoutWrite;
      process.stderr.write = this.originalStderrWrite;
    }
  }

  // Delegate all logging methods to underlying logger

  public info(message: string, context?: Record<string, unknown>): void {
    this.underlying.info(message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.underlying.warn(message, context);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.underlying.error(message, context);
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.underlying.debug(message, context);
  }

  public child(context: Record<string, unknown>): ILogger {
    return new VerboseLogger(this.underlying.child(context), this.verbose);
  }
}
