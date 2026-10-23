import { test } from '@playwright/test';
import { RolesComponent } from 'tests/pages/RolesPage';

interface RolesTest {
    roles: RolesComponent;
}

export const rolesTest = test.extend<RolesTest>({
  roles: async ({ page }, use) => {
    await use(new RolesComponent(page));
  },
});
