/**
 * Base class for diagnostic sources
 */

import type {
	DiagnosticSource,
	Logger,
	PathNormalizer,
	SecurityValidator,
} from '../interfaces.js';
import type {
	CollectorConfig,
	DiagnosticsResult,
	ValidationStatus,
} from '../types.js';

export abstract class BaseDiagnosticSource implements DiagnosticSource {
	protected readonly logger: Logger;
	protected readonly pathNormalizer: PathNormalizer;
	protected readonly securityValidator: SecurityValidator;

	protected constructor(
		logger: Logger,
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator
	) {
		this.logger = logger;
		this.pathNormalizer = pathNormalizer;
		this.securityValidator = securityValidator;
	}

	public abstract collect(config: CollectorConfig): Promise<DiagnosticsResult>;

	public abstract validate(): Promise<ValidationStatus>;

	/**
	 * Validate configuration before collection
	 */
	protected validateConfig(config: CollectorConfig): void {
		if (config.cwd === '') {
			throw new Error('cwd is required in configuration');
		}

		if (config.timeout <= 0) {
			throw new Error('timeout must be positive');
		}

		if (config.maxBuffer <= 0) {
			throw new Error('maxBuffer must be positive');
		}
	}

	/**
	 * Create a timeout promise
	 */
	protected async createTimeout(ms: number): Promise<never> {
		return new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error(`Operation timed out after ${String(ms)}ms`));
			}, ms);
		});
	}

	/**
	 * Execute operation with timeout
	 */
	protected async withTimeout<T>(
		operation: Promise<T>,
		timeoutMs: number
	): Promise<T> {
		return Promise.race([
			operation,
			this.createTimeout(timeoutMs),
		]);
	}
}
