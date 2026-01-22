/**
 * JSON formatter
 * @module infrastructure/formatting/JsonFormatter
 */

import { injectable } from 'inversify';

import type { IFormatter } from '../../core/index.js';

/**
 * JSON formatter for data serialization
 */
@injectable()
export class JsonFormatter<T> implements IFormatter<T> {
	private readonly indentation: number;

	public constructor(indentation = 2) {
		this.indentation = indentation;
	}

	public format(data: T): string {
		return JSON.stringify(data, null, this.indentation);
	}
}
