/**
 * Formatter contract for output formatting
 * @module core/contracts/IFormatter
 */

export interface IFormatter<TInput, TOutput = string> {
	format(input: TInput): TOutput;
}
