import nextEnv from '@next/env';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

nextEnv.loadEnvConfig(process.cwd());

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    reporters: ['default', 'hanging-process'],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/.storybook/**',
        '**/storybook-static/**',
        '**/public/**',
        '**/node_modules/**',
        '**/.next/**',
        'next.config.js',
        'next-env.d.ts',
        'sentry.*.config.js',
      ],
    },
    exclude: [...configDefaults.exclude],
  },
});
