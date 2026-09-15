import { expect } from '@playwright/test';
import { faqTest as test } from 'tests/fixtures/faqTest';

test.describe('FAQ', () => {
  test('abre a página de perguntas frequentes e expande uma pergunta', async ({ page, faq }) => {
    await faq.openFaqPage();

    const count = await faq.questions.count();
    expect(count).toBeGreaterThan(0);

    const first = await faq.firstQuestion();
    await first.click();
    await expect(page.locator('.accordion-collapse.show, .accordion-body').first()).toBeVisible();

    await faq.backButton.first().click();
    await expect(faq.formMainTitle).toBeVisible();
  });
});
