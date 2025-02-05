import { test } from '@playwright/test';
import { UserLogsComponent } from 'tests/pages/UserLogsPage';

interface UserLogsTest {
  userLogs: UserLogsComponent;
}

export const userLogsTest = test.extend<UserLogsTest>({
  userLogs: async ({ page }, use) => {
    await use(new UserLogsComponent(page));
  },
});
