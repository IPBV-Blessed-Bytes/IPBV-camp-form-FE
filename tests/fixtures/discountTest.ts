import { test } from '@playwright/test';
import { DiscountComponent } from 'tests/pages/DiscountPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface DiscountTest {
  discount: DiscountComponent;
}

export const discountTest = test.extend<DiscountTest>({
  discount: async ({ page }, use) => {
    await setupPage(page);
    await use(new DiscountComponent(page));
  },
});
