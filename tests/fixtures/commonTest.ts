import { test } from '@playwright/test';
import { PermissionsComponent } from 'tests/pages/PermissionPage';

interface CommonTest {
  permission: PermissionsComponent;
}

export const commonTest = test.extend<CommonTest>({
  permission: async ({ page }, use) => {
    await use(new PermissionsComponent(page));
  },
});
