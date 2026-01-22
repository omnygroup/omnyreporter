export * from './types';
export * from './matchers/ExactMatcher';
export * from './matchers/PrefixMatcher';
export * from './adapters/ViteAliasAdapter';
export * from './parser/TsconfigParser';
export * from './normalizer/PathNormalizer';
export * from './factory/AliasMatcherFactory';
export * from './generator/AliasGenerator';

// Default orchestrator for Vite
import { ViteAliasAdapter, ViteAliasEntry } from './adapters/ViteAliasAdapter';
import { AliasMatcherFactory } from './factory/AliasMatcherFactory';
import { AliasGenerator } from './generator/AliasGenerator';
import { PathNormalizer } from './normalizer/PathNormalizer';
import { TsconfigParser } from './parser/TsconfigParser';

export function createViteAliasResolver(): AliasGenerator<ViteAliasEntry[]> {
	return new AliasGenerator(
		new TsconfigParser(),
		new PathNormalizer(),
		new AliasMatcherFactory(),
		new ViteAliasAdapter()
	);
}

export function getViteAliases(rootDir?: string): ViteAliasEntry[] {
	return createViteAliasResolver().generate(rootDir);
}
