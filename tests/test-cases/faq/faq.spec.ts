import { expect } from '@playwright/test';
import { faqTest as test } from 'tests/fixtures/faqTest';

test.describe('FAQ flow', () => {
  test('Verify if it is possible to view FAQ page', async ({ page, faq }) => {
    await page.goto('/perguntas', { waitUntil: 'commit' });

    await expect(faq.faqHeading).toBeVisible();

    await faq.inscriptionQuestionButton.click();
    await expect(faq.inscriptionQuestionContent).toBeVisible();

    await faq.childrenQuestionButton.click();
    await expect(faq.childrenQuestionContent).toBeVisible();

    await faq.roomQuestionButton.click();
    await expect(faq.roomQuestionContent).toBeVisible();

    const questionCount = await faq.question.count();
    expect(questionCount).toBeGreaterThan(0);

    await faq.backButton.click();
    await expect(page).toHaveURL(/\/$/);
  });
});
