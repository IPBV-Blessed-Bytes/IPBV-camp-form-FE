import { test } from '@playwright/test';
import { FaqComponent } from 'tests/pages/FaqPage';

interface FaqTest {
  faq: FaqComponent;
}

export const faqTest = test.extend<FaqTest>({
  faq: async ({ page }, use) => {
    await use(new FaqComponent(page));
  },
});
