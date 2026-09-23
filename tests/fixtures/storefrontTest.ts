import { test } from '@playwright/test';
import { StorefrontComponent } from 'tests/pages/StorefrontPage';

interface StorefrontTest {
  storefront: StorefrontComponent;
}

export const storefrontTest = test.extend<StorefrontTest>({
  storefront: async ({ page }, use) => {
    await use(new StorefrontComponent(page));
  },
});
