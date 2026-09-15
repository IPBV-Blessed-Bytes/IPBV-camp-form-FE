import { defineConfig } from '@playwright/test';

import { config as authentication } from 'tests/test-cases/authentication/config';
import { config as common } from 'tests/test-cases/common/config';
import { config as form } from 'tests/test-cases/form/config';
import { config as adminHome } from 'tests/test-cases/adminHome/config';
import { config as discount } from 'tests/test-cases/discount/config';
import { config as room } from 'tests/test-cases/room/config';
import { config as checkRegistration } from 'tests/test-cases/checkRegistration/config';
import { config as faq } from 'tests/test-cases/faq/config';
import { config as extraMeals } from 'tests/test-cases/extraMeals/config';
import { config as userCreation } from 'tests/test-cases/userCreation/config';
import { config as checkin } from 'tests/test-cases/checkin/config';

export default defineConfig({
  testDir: './tests',

  // E2E contra um único dev server + banco compartilhado: execução serial evita
  // contenção de recursos e condições de corrida entre suites que mutam estado.
  workers: 1,

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
    // Evita que uma ação em elemento opcional (ex.: modal que não aparece)
    // fique presa até o timeout do teste inteiro.
    actionTimeout: 15000,
  },

  projects: [
    authentication,
    common,
    form,
    adminHome,
    discount,
    room,
    checkRegistration,
    faq,
    extraMeals,
    userCreation,
    checkin,
  ],
});
