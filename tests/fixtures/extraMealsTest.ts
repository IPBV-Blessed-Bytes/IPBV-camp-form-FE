import { test } from '@playwright/test';
import { ExtraMealsComponent } from 'tests/pages/extraMealsPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface ExtraMealsTest {
  extraMeals: ExtraMealsComponent;
}

export const extraMealsTest = test.extend<ExtraMealsTest>({
  extraMeals: async ({ page }, use) => {
    await setupPage(page);
    await use(new ExtraMealsComponent(page));
  },
});
