import { test } from '@playwright/test';
import { CamperTableComponent } from 'tests/pages/CamperTablePage';

interface CamperTableTest {
    camperTable: CamperTableComponent;
}

export const camperTableTest = test.extend<CamperTableTest>({
  camperTable: async ({ page }, use) => {
    await use(new CamperTableComponent(page));
  },
});
