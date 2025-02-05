import { test } from '@playwright/test';
import { AuthenticationComponent } from 'tests/pages/authentication/AuthenticationPage';

interface AuthenticationTest {
  authentication: AuthenticationComponent;
}

export const authenticationTest = test.extend<AuthenticationTest>({
  authentication: async ({ page }, use) => {
    await use(new AuthenticationComponent(page));
  },
});
