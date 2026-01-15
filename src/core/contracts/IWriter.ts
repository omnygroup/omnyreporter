/**
 * Writer contract for result output
 * @module core/contracts/IWriter
 */

import { type Result ,type  WriteStats,type  WriteOptions } from '../types/index.js';

export interface IWriter<TData> {
  /**
   * Write data to file or stream
   * @param data Data to write
   * @param options Write options
   * @returns Result with write statistics or error
   */
  write(data: TData, options?: WriteOptions): Promise<Result<WriteStats, Error>>;
}
