import { defineConfig } from '@playwright/test';

import { config as authentication } from 'tests/test-cases/authentication/config';
import { config as common } from 'tests/test-cases/common/config';
// import { config as form } from 'tests/test-cases/form/config';
// import { config as camperTable } from 'tests/test-cases/camperTable/config';
import { config as adminHome } from 'tests/test-cases/adminHome/config';
// import { config as ride } from 'tests/test-cases/ride/config';
import { config as discount } from 'tests/test-cases/discount/config';
import { config as room } from 'tests/test-cases/room/config';
import { config as checkRegistration } from 'tests/test-cases/checkRegistration/config';
import { config as faq } from 'tests/test-cases/faq/config';
import { config as extraMeals } from 'tests/test-cases/extraMeals/config';
// import { config as userLogs } from 'tests/test-cases/userLogs/config';
// import { config as vacanciesNumber } from 'tests/test-cases/vacanciesNumber/config';
import { config as userCreation } from 'tests/test-cases/userCreation/config';
import { config as checkin } from 'tests/test-cases/checkin/config';

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

  projects: [
    authentication,
    common,
    // form,
    // camperTable,
    adminHome,
    // ride,
    discount,
    room,
    checkRegistration,
    faq,
    extraMeals,
    // userLogs,
    // vacanciesNumber,
    userCreation,
    checkin,
  ],
});
