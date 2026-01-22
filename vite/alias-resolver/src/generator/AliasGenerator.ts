import { IAliasGenerator, IPathParser, IPathNormalizer, IMatcherFactory, IAliasAdapter } from '../types';

export class AliasGenerator<T> implements IAliasGenerator<T> {
	constructor(
		private readonly parser: IPathParser,
		private readonly normalizer: IPathNormalizer,
		private readonly factory: IMatcherFactory,
		private readonly adapter: IAliasAdapter<T>
	) {}

	generate(rootDir: string = process.cwd()): T {
		const rawPaths = this.parser.parse(rootDir);
		const normalized = this.normalizer.normalize(rawPaths);
		const matchers = this.factory.create(normalized, rootDir);
		return this.adapter.adapt(matchers);
	}
}
