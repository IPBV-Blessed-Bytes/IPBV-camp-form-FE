import { test } from '@playwright/test';
import { PermissionsComponent } from 'tests/pages/PermissionPage';
import { AvoidBypassComponent } from 'tests/pages/AvoidBypassPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface CommonTest {
  permission: PermissionsComponent;
  avoidBypass: AvoidBypassComponent;
}

export const commonTest = test.extend<CommonTest>({
  permission: async ({ page }, use) => {
    await setupPage(page);
    await use(new PermissionsComponent(page));
  },
  avoidBypass: async ({ page }, use) => {
    await setupPage(page);
    await use(new AvoidBypassComponent(page));
  },
});
