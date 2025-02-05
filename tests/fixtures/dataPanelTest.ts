import { test } from '@playwright/test';
import { DataPanelComponent } from 'tests/pages/DataPanelPage';

interface DataPanelTest {
    dataPanel: DataPanelComponent;
}

export const dataPanelTest = test.extend<DataPanelTest>({
    dataPanel: async ({ page }, use) => {
    await use(new DataPanelComponent(page));
  },
});
