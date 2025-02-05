import { defineConfig } from '@playwright/test';

import { config as authentication } from 'tests/test-cases/authentication/config';
import { config as common } from 'tests/test-cases/common/config';
import { config as form } from 'tests/test-cases/form/config'

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

  projects: [authentication, common, form],
});
