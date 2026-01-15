import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@domain': resolve(__dirname, 'src/domain'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@application': resolve(__dirname, 'src/application'),
      '@reporters': resolve(__dirname, 'src/reporters'),
      '@view': resolve(__dirname, 'src/view'),
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests'),
      '@utils': resolve(__dirname, 'src/core/utils'),
      '@types': resolve(__dirname, 'src/core/types')
    }
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
        preserveModulesRoot: 'src'
      }
    }
  }
});


