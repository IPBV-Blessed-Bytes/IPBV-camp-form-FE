import { test } from '@playwright/test';
import { AdminLoginComponent } from 'tests/pages/AdminLoginPage';

interface AdminLoginTest {
  adminLogin: AdminLoginComponent;
}

export const adminLoginTest = test.extend<AdminLoginTest>({
  adminLogin: async ({ page }, use) => {
    await use(new AdminLoginComponent(page));
  },
});
