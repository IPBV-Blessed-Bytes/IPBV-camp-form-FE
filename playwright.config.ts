import { defineConfig } from '@playwright/test';

import { config as authentication } from 'tests/test-cases/authentication/config';
import { config as common } from 'tests/test-cases/common/config';
import { config as form } from 'tests/test-cases/form/config'
import { config as camperTable } from 'tests/test-cases/camperTable/config'
import { config as adminHome } from 'tests/test-cases/adminHome/config'
import { config as ride } from 'tests/test-cases/ride/config'

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

  projects: [authentication, common, form, camperTable, adminHome, ride],
});
