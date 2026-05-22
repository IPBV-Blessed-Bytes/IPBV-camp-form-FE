import { test } from '@playwright/test';
import { FaqComponent } from 'tests/pages/FaqPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface FaqTest {
  faq: FaqComponent;
}

export const faqTest = test.extend<FaqTest>({
  faq: async ({ page }, use) => {
    await setupPage(page);
    await use(new FaqComponent(page));
  },
});
