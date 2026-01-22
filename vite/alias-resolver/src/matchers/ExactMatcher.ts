import { IAliasMatcher, AliasDescriptor } from '../types';

export class ExactMatcher implements IAliasMatcher {
	constructor(
		private readonly alias: string,
		private readonly replacement: string
	) {}

	test(request: string): boolean {
		return request === this.alias;
	}

	toDescriptor(): AliasDescriptor {
		return {
			type: 'exact',
			alias: this.alias,
			replacement: this.replacement,
		};
	}
}
