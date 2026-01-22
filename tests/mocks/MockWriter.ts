/**
 * Mock implementation of IWriter for testing
 * @module tests/mocks/MockWriter
 */

import { ok, err } from 'neverthrow';

import type { IWriter } from '../../src/core/contracts/index.js';
import type { WriteStats, Result } from '../../src/core/types/index.js';

export class MockWriter<TData> implements IWriter<TData> {
	private writtenData: TData[] = [];
	private errorToThrow: Error | null = null;

	async write(data: TData): Promise<Result<WriteStats, Error>> {
		if (this.errorToThrow !== null) {
			return await Promise.resolve(err(this.errorToThrow));
		}
		this.writtenData.push(data);
		return await Promise.resolve(ok({ bytesWritten: JSON.stringify(data).length, path: 'mock-path' }));
	}

	getWrittenData(): TData[] {
		return this.writtenData;
	}

	setError(error: Error): void {
		this.errorToThrow = error;
	}

	clearError(): void {
		this.errorToThrow = null;
	}

	clear(): void {
		this.writtenData = [];
	}
}
