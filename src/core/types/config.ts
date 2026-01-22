/**
 * Configuration types
 * @module core/types/config
 */

/** Options for file operations (low-level) */
export interface FileOperationOptions {
	readonly atomic?: boolean;
	readonly ensureDir?: boolean;
	readonly overwrite?: boolean;
}

/** Options for writer operations (must include fileName) */
export interface WriteOptions extends FileOperationOptions {
	readonly fileName: string;
}

/** Statistics about write operations */
export interface WriteStats {
	readonly filesWritten: number;
	readonly bytesWritten: number;
	readonly duration: number;
	readonly timestamp: Date;
}
