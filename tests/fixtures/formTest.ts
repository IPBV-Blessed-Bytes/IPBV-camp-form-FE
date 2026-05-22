import { test } from '@playwright/test';
import { FormComponent } from 'tests/pages/FormPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface FormTest {
  form: FormComponent;
}

export const formTest = test.extend<FormTest>({
  form: async ({ page }, use) => {
    await setupPage(page);
    await use(new FormComponent(page));
  },
});
