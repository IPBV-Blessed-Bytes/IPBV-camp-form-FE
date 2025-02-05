import { defineConfig } from '@playwright/test';

import { config as authentication } from 'tests/test-cases/authentication/config';

export default defineConfig({
  testDir: './tests',

  reporter: [
    [
      'html',
      {
        open: 'never',
      },
    ],
  ],

  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [authentication],
});
