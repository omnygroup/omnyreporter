import { resolve } from 'path';

import { defineConfig } from 'vite';

import { getViteAliases } from './vite/alias-resolver/src/index';

export default defineConfig({
	resolve: {
		alias: getViteAliases(),
	},
	build: {
		target: 'node16',
		outDir: 'dist',
		emptyOutDir: true,
		minify: false,
		ssr: true,
		rollupOptions: {
			input: resolve(__dirname, 'src/view/cli/App.ts'),
			output: {
				dir: 'dist',
				format: 'es',
				entryFileNames: '[name].js',
				preserveModules: true,
				preserveModulesRoot: 'src',
			},
		},
	},
});
