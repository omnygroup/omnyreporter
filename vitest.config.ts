import path from 'path';

import { defineConfig } from 'vitest/config';

const aliasEntries = [
	['@', path.resolve(__dirname, './src')],
	['@application', path.resolve(__dirname, './src/application')],
	['@application/*', path.resolve(__dirname, './src/application/*')],
	['@core', path.resolve(__dirname, './src/core')],
	['@core/*', path.resolve(__dirname, './src/core/*')],
	['@domain', path.resolve(__dirname, './src/domain')],
	['@domain/*', path.resolve(__dirname, './src/domain/*')],
	['@infrastructure', path.resolve(__dirname, './src/infrastructure')],
	['@infrastructure/*', path.resolve(__dirname, './src/infrastructure/*')],
	['@reporters', path.resolve(__dirname, './src/reporters')],
	['@reporters/*', path.resolve(__dirname, './src/reporters/*')],
	['@view', path.resolve(__dirname, './src/view')],
	['@view/*', path.resolve(__dirname, './src/view/*')],
	['@tests', path.resolve(__dirname, './tests')],
	['@utils', path.resolve(__dirname, './src/core/utils')],
	['@types', path.resolve(__dirname, './src/core/types')],
	['@config', path.resolve(__dirname, './src/core/types/config.ts')],
] as const;
export default defineConfig({
	test: {
		// Environment setup
		environment: 'node',
		globals: true,

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'dist/',
				'bin/',
				'**/*.test.ts',
				'**/*.mock.ts',
				'**/index.ts',
				'src/view/**', // Excluded from compilation
			],
			thresholds: {
				global: {
					lines: 70,
					functions: 70,
					branches: 65,
					statements: 70,
				},
			},
		},

		// Include and exclude patterns
		include: ['tests/**/*.test.ts', 'build/tests/**/*.test.js'],
		exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

		// Test reporter
		reporters: ['verbose'],

		// Timeout settings
		testTimeout: 10000,

		// Module resolution
		alias: Object.fromEntries(aliasEntries) as Record<string, string>,
	},
	resolve: {
		alias: Object.fromEntries(aliasEntries) as Record<string, string>,
	},
});
