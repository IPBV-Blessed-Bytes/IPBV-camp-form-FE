import { test } from '@playwright/test';
import { CheckRegistrationComponent } from 'tests/pages/checkRegistrationPage';

interface CheckRegistrationTest {
  checkRegistration: CheckRegistrationComponent;
}

export const checkRegistrationTest = test.extend<CheckRegistrationTest>({
  checkRegistration: async ({ page }, use) => {
    await use(new CheckRegistrationComponent(page));
  },
});
