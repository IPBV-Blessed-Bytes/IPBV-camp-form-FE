import { test } from '@playwright/test';
import { AdminHomeComponent } from 'tests/pages/AdminHomePage';
import { setupPage } from 'tests/fixtures/setupPage';

interface AdminHomeTest {
  adminHome: AdminHomeComponent;
}

export const adminHomeTest = test.extend<AdminHomeTest>({
  adminHome: async ({ page }, use) => {
    await setupPage(page);
    await use(new AdminHomeComponent(page));
  },
});
