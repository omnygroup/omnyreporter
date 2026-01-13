export class PathNormalizer {
	#patterns = [
		/^[A-Za-z]:[/\\].*?omnyflow-sdk[/\\](.+)$/,
		/^[^:]*omnyflow-sdk[/\\](.+)$/,
		/^\/.*?\/omnyflow-sdk[/\\](.+)$/,
	];

	normalize(filePath) {
		if (!filePath || typeof filePath !== 'string') {
			return '';
		}

		const trimmedPath = filePath.trim();

		for (const pattern of this.#patterns) {
			const match = trimmedPath.match(pattern);
			if (match && match[1]) {
				return match[1].replace(/\\/g, '/');
			}
		}

		return trimmedPath.replace(/\\/g, '/');
	}

	isProjectFile(filePath) {
		if (!filePath || typeof filePath !== 'string') {
			return false;
		}

		const normalized = this.normalize(filePath);

		const excludePatterns = ['node_modules/', 'dist/', 'coverage/', '.npm/', '.pnpm/', '__snapshots__/'];

		return !excludePatterns.some((pattern) => normalized.includes(pattern));
	}

	getDirectory(filePath) {
		const normalized = this.normalize(filePath);
		const lastSlashIndex = normalized.lastIndexOf('/');
		return lastSlashIndex > 0 ? normalized.substring(0, lastSlashIndex) : '';
	}

	getFilename(filePath) {
		const normalized = this.normalize(filePath);
		const lastSlashIndex = normalized.lastIndexOf('/');
		return lastSlashIndex >= 0 ? normalized.substring(lastSlashIndex + 1) : normalized;
	}
}
