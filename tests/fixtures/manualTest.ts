import { test } from '@playwright/test';
import { ManualComponent } from 'tests/pages/ManualPage';

interface ManualTest {
  manual: ManualComponent;
}

export const manualTest = test.extend<ManualTest>({
  manual: async ({ page }, use) => {
    await use(new ManualComponent(page));
  },
});
