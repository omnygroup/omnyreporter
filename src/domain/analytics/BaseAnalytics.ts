/**
 * Base Analytics Collector
 * Simple base class for collecting and calculating statistics
 * @module domain/analytics/BaseAnalytics
 */

/**
 * Base analytics collector
 * Provides common functionality for statistics collection
 */
export abstract class BaseAnalytics<TInput, TStats> {
  protected stats: TStats;

  protected constructor() {
    this.stats = this.createInitialStats();
  }

  /**
   * Reset statistics
   */
  public reset(): void {
    this.stats = this.createInitialStats();
  }

  /**
   * Get current statistics snapshot
   * @returns Statistics
   */
  public getSnapshot(): TStats {
    return this.stats;
  }

  /**
   * Collect single item
   * @param input Item to collect
   */
  public abstract collect(input: TInput): void;

  /**
   * Create initial statistics
   * @returns Initial stats
   */
  protected abstract createInitialStats(): TStats;
}
