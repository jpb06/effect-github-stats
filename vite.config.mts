import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/temp',
        'src/tests',
        'src/**/*.type.ts',
        'src/index.ts',
        'src/types',
      ],
    },
  },
});
