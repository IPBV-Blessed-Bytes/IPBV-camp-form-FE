import { test } from '@playwright/test';
import { AdminHomeComponent } from 'tests/pages/AdminHomePage';

interface AdminHomeTest {
  adminHome: AdminHomeComponent;
}

export const adminHomeTest = test.extend<AdminHomeTest>({
  adminHome: async ({ page }, use) => {
    await use(new AdminHomeComponent(page));
  },
});
