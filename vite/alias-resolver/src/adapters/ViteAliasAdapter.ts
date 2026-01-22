import { IAliasAdapter, IAliasMatcher } from '../types';

export interface ViteAliasEntry {
	find: string | RegExp;
	replacement: string;
}

export class ViteAliasAdapter implements IAliasAdapter<ViteAliasEntry[]> {
	adapt(matchers: IAliasMatcher[]): ViteAliasEntry[] {
		return matchers.map((matcher) => {
			const descriptor = matcher.toDescriptor();

			if (descriptor.type === 'prefix') {
				const escaped = descriptor.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				return {
					find: new RegExp(`^${escaped}/`),
					replacement: descriptor.replacement,
				};
			}

			return {
				find: descriptor.alias,
				replacement: descriptor.replacement,
			};
		});
	}
}
