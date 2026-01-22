import { IAliasMatcher, AliasDescriptor } from '../types';

export class PrefixMatcher implements IAliasMatcher {
	constructor(
		private readonly prefix: string,
		private readonly replacement: string
	) {}

	test(request: string): boolean {
		return request === this.prefix || request.startsWith(this.prefix + '/');
	}

	toDescriptor(): AliasDescriptor {
		return {
			type: 'prefix',
			alias: this.prefix,
			replacement: this.replacement,
		};
	}
}
