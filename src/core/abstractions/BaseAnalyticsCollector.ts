/**
 * Base analytics collector abstract class
 * Provides template for all analytics implementations
 * @module core/abstractions/BaseAnalyticsCollector
 */

import type { IAnalyticsCollector } from '../contracts/index.js';
import type { StatisticsBase } from '../types/index.js';

/**
 * Template method pattern for analytics collection
 * Subclasses implement specific statistic calculations
 * @template TInput Type of input data to collect
 * @template TStats Type of statistics snapshot
 */
export abstract class BaseAnalyticsCollector<TInput, TStats extends StatisticsBase>
  implements IAnalyticsCollector<TInput, TStats>
{
  protected stats: TStats;

  protected constructor() {
    this.stats = this.createInitialStats();
  }

  /**
   * Collect and process input data
   * Updates internal statistics
   * @param input Data to collect
   */
  public abstract collect(input: TInput): void;

  /**
   * Get immutable snapshot of current statistics
   * @returns Statistics snapshot
   */
  public getSnapshot(): TStats {
    return { ...this.stats };
  }

  /**
   * Reset all statistics to initial state
   */
  public reset(): void {
    this.stats = this.createInitialStats();
  }

  /**
   * Create initial statistics object
   * Subclasses must implement to define default values
   * @returns Initial statistics
   */
  protected abstract createInitialStats(): TStats;

  /**
   * Protected update method for subclasses
   * @param updater Function to update stats
   */
  protected updateStats(updater: (stats: TStats) => TStats): void {
    this.stats = updater({ ...this.stats });
  }
}
