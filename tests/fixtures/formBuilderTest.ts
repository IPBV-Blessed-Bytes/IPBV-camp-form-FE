import { test } from '@playwright/test';
import { FormBuilderComponent } from 'tests/pages/FormBuilderPage';

interface FormBuilderTest {
  formBuilder: FormBuilderComponent;
}

export const formBuilderTest = test.extend<FormBuilderTest>({
  formBuilder: async ({ page }, use) => {
    await use(new FormBuilderComponent(page));
  },
});
