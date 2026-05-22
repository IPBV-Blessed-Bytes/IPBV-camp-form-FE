import { test } from '@playwright/test';
import { CheckinComponent } from 'tests/pages/CheckinPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface CheckinTest {
  checkin: CheckinComponent;
}

export const checkinTest = test.extend<CheckinTest>({
  checkin: async ({ page }, use) => {
    await setupPage(page);
    await use(new CheckinComponent(page));
  },
});
