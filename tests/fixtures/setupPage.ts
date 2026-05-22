import { Page } from '@playwright/test';

export const FORM_CONTEXT_KEY = 'formContext';

export const setupPage = async (page: Page, formContext: string = 'form-on') => {
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, value);
    },
    { key: FORM_CONTEXT_KEY, value: formContext },
  );

  await page.route('**/form-context', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ formContext }),
    });
  });
};
