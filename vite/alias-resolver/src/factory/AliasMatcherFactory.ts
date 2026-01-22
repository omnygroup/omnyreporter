import { resolve } from 'path';

import { ExactMatcher } from '../matchers/ExactMatcher';
import { PrefixMatcher } from '../matchers/PrefixMatcher';
import { IMatcherFactory, INormalizedPaths, IAliasMatcher } from '../types';

export class AliasMatcherFactory implements IMatcherFactory {
	create(normalized: INormalizedPaths, rootDir: string): IAliasMatcher[] {
		const matchers: IAliasMatcher[] = [];

		for (const [prefix, targetDir] of Object.entries(normalized.wildcards)) {
			matchers.push(new PrefixMatcher(prefix, resolve(rootDir, targetDir) + '/'));
		}

		for (const [key, targetFile] of Object.entries(normalized.exact)) {
			matchers.push(new ExactMatcher(key, resolve(rootDir, targetFile)));
		}

		return matchers;
	}
}
