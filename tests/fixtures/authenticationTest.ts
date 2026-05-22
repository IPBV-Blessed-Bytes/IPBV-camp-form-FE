import { test } from '@playwright/test';
import { AuthenticationComponent } from 'tests/pages/AuthenticationPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface AuthenticationTest {
  authentication: AuthenticationComponent;
}

export const authenticationTest = test.extend<AuthenticationTest>({
  authentication: async ({ page }, use) => {
    await setupPage(page);
    await use(new AuthenticationComponent(page));
  },
});
