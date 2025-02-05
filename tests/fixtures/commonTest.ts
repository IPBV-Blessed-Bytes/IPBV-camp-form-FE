import { test } from '@playwright/test';
import { PermissionsComponent } from 'tests/pages/PermissionPage';
import { AvoidBypassComponent } from 'tests/pages/AvoidBypassPage';

interface CommonTest {
  permission: PermissionsComponent;
  avoidBypass: AvoidBypassComponent;
}

export const commonTest = test.extend<CommonTest>({
  permission: async ({ page }, use) => {
    await use(new PermissionsComponent(page));
  },
  avoidBypass: async ({ page }, use) => {
    await use(new AvoidBypassComponent(page));
  },
});
