/**
 * Base mapper abstract class
 * Provides template for data transformation
 * @module core/abstractions/BaseMapper
 */

/**
 * Generic mapper pattern for transforming data
 * @template TInput Type of input data
 * @template TOutput Type of output data
 */
export abstract class BaseMapper<TInput, TOutput> {
  /**
   * Map input to output
   * @param input Input data
   * @returns Transformed output
   */
  public abstract map(input: TInput): TOutput;

  /**
   * Map array of input data
   * @param inputs Array of input data
   * @returns Array of transformed output
   */
  public mapArray(inputs: readonly TInput[]): readonly TOutput[] {
    return inputs.map((input) => this.map(input));
  }

  /**
   * Map optional input (if present)
   * @param input Optional input data
   * @returns Optional transformed output
   */
  public mapOptional(input: TInput | undefined): TOutput | undefined {
    return input !== undefined ? this.map(input) : undefined;
  }
}
