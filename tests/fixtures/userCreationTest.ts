import { test } from '@playwright/test';
import { UserCreationComponent } from 'tests/pages/UserCreationPage';

interface UserCreationTest {
  userCreation: UserCreationComponent;
}

export const userCreationTest = test.extend<UserCreationTest>({
    userCreation: async ({ page }, use) => {
    await use(new UserCreationComponent(page));
  },
});
