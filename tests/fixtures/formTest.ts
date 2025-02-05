import { test } from '@playwright/test';
import { FormComponent } from 'tests/pages/FormPage';

interface FormTest {
  form: FormComponent;
}

export const formTest = test.extend<FormTest>({
  form: async ({ page }, use) => {
    await use(new FormComponent(page));
  },
});
