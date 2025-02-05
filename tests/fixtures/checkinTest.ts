import { test } from '@playwright/test';
import { CheckinComponent } from 'tests/pages/CheckinPage';

interface CheckinTest {
    checkin: CheckinComponent;
}

export const checkinTest = test.extend<CheckinTest>({
  checkin: async ({ page }, use) => {
    await use(new CheckinComponent(page));
  },
});
