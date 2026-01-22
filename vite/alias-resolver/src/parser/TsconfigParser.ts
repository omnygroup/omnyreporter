import { readFileSync } from 'fs';
import { resolve } from 'path';

import { IPathParser, ITsconfigPaths } from '../types';

export type FileReader = (path: string) => string;

export class TsconfigParser implements IPathParser {
	private readonly fsRead: FileReader;

	constructor(deps?: { fsRead?: FileReader }) {
		this.fsRead = deps?.fsRead ?? ((p: string) => readFileSync(p, 'utf8'));
	}

	parse(rootDir: string): ITsconfigPaths {
		try {
			const cfgPath = resolve(rootDir, 'tsconfig.json');
			const raw = this.fsRead(cfgPath);
			const cfg = JSON.parse(raw) as { compilerOptions?: { paths?: ITsconfigPaths } };
			return cfg.compilerOptions?.paths ?? {};
		} catch (error) {
			console.warn(`[TsconfigParser] Warning: Could not parse tsconfig at ${rootDir}`, error);
			return {};
		}
	}
}
