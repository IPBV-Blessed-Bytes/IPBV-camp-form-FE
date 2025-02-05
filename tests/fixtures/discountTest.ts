import { test } from '@playwright/test';
import { DiscountComponent } from 'tests/pages/DiscountPage';

interface DiscountTest {
    discount: DiscountComponent;
}

export const discountTest = test.extend<DiscountTest>({
  discount: async ({ page }, use) => {
    await use(new DiscountComponent(page));
  },
});
