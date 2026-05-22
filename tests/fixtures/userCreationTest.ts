import { test } from '@playwright/test';
import { UserCreationComponent } from 'tests/pages/UserCreationPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface UserCreationTest {
  userCreation: UserCreationComponent;
}

export const userCreationTest = test.extend<UserCreationTest>({
  userCreation: async ({ page }, use) => {
    await setupPage(page);
    await use(new UserCreationComponent(page));
  },
});
