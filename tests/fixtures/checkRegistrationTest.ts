import { test } from '@playwright/test';
import { CheckRegistrationComponent } from 'tests/pages/checkRegistrationPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface CheckRegistrationTest {
  checkRegistration: CheckRegistrationComponent;
}

export const checkRegistrationTest = test.extend<CheckRegistrationTest>({
  checkRegistration: async ({ page }, use) => {
    await setupPage(page);
    await use(new CheckRegistrationComponent(page));
  },
});
