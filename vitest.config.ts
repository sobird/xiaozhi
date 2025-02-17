import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

const r = (p: string) => { return resolve(__dirname, p); };

export default defineConfig({
  resolve: {
    // @see https://github.com/vitest-dev/vitest/discussions/3042
    alias: [{ find: '@', replacement: resolve(__dirname, './') }],
  },
  test: {
    globals: true,
    alias: {
      '@/': r('./'),
    },
    reporters: 'verbose',
  },
});
