import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/test.ts',
        'src/tests/**/*',
        'src/**/*.type.ts',
        'src/index.ts',
        'src/types',
      ],
    },
  },
});
