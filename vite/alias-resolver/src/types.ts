export interface AliasDescriptor {
	type: 'exact' | 'prefix';
	alias: string;
	replacement: string;
}

export interface IAliasMatcher {
	test(request: string): boolean;
	toDescriptor(): AliasDescriptor;
}

export type ITsconfigPaths = Record<string, string | string[]>;

export interface INormalizedPaths {
	wildcards: Record<string, string>;
	exact: Record<string, string>;
}

export interface IPathParser {
	parse(rootDir: string): ITsconfigPaths;
}

export interface IPathNormalizer {
	normalize(paths: ITsconfigPaths): INormalizedPaths;
}

export interface IMatcherFactory {
	create(normalized: INormalizedPaths, rootDir: string): IAliasMatcher[];
}

export interface IAliasAdapter<T = unknown> {
	adapt(matchers: IAliasMatcher[]): T;
}

export interface IAliasGenerator<T = unknown> {
	generate(rootDir?: string): T;
}
