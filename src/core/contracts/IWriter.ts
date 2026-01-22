/**
 * Writer contract for result output
 * @module core/contracts/IWriter
 */

import { type Result, type WriteStats, type WriteOptions } from '../types/index.js';

export interface IWriter<TData> {
	write(data: TData, options: WriteOptions): Promise<Result<WriteStats, Error>>;
}
