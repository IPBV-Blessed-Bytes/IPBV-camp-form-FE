import { test } from '@playwright/test';
import { PlatformComponent } from 'tests/pages/PlatformPage';

interface PlatformTest {
  platform: PlatformComponent;
}

export const platformTest = test.extend<PlatformTest>({
  platform: async ({ page }, use) => {
    await use(new PlatformComponent(page));
  },
});
