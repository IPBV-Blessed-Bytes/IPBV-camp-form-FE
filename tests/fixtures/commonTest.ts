import { test } from '@playwright/test';
import { PermissionsComponent } from 'tests/pages/PermissionPage';
import { BypassComponent } from 'tests/pages/BypassPage';

interface CommonTest {
  permission: PermissionsComponent;
  bypass: BypassComponent;
}

export const commonTest = test.extend<CommonTest>({
  permission: async ({ page }, use) => {
    await use(new PermissionsComponent(page));
  },
  bypass: async ({ page }, use) => {
    await use(new BypassComponent(page));
  },
});
