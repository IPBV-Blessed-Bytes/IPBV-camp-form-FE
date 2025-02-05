import { test } from '@playwright/test';
import { FeedbackComponent } from 'tests/pages/FeedbackPage';

interface FeedbackTest {
  feedback: FeedbackComponent;
}

export const feedbackTest = test.extend<FeedbackTest>({
  feedback: async ({ page }, use) => {
    await use(new FeedbackComponent(page));
  },
});
