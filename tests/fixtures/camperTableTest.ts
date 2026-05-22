import { test } from '@playwright/test';
import { CamperTableComponent } from 'tests/pages/CamperTablePage';
import { setupPage } from 'tests/fixtures/setupPage';

interface CamperTableTest {
  camperTable: CamperTableComponent;
}

export const camperTableTest = test.extend<CamperTableTest>({
  camperTable: async ({ page }, use) => {
    await setupPage(page);
    await use(new CamperTableComponent(page));
  },
});
