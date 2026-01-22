import { IPathNormalizer, ITsconfigPaths, INormalizedPaths } from '../types';

export class PathNormalizer implements IPathNormalizer {
	normalize(paths: ITsconfigPaths): INormalizedPaths {
		const wildcards: Record<string, string> = {};
		const exact: Record<string, string> = {};

		for (const [key, targets] of Object.entries(paths)) {
			const target = Array.isArray(targets) ? targets[0] : targets;

			if (key.endsWith('/*')) {
				const baseKey = key.slice(0, -2);
				wildcards[baseKey] = target.replace(/\/\*$/, '');
			} else {
				exact[key] = target;
			}
		}

		return { wildcards, exact };
	}
}
