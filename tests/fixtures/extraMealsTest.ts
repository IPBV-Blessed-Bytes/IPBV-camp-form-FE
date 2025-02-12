import { test } from '@playwright/test';
import { ExtraMealsComponent } from 'tests/pages/extraMealsPage';

interface ExtraMealsTest {
  extraMeals: ExtraMealsComponent;
}

export const extraMealsTest = test.extend<ExtraMealsTest>({
  extraMeals: async ({ page }, use) => {
    await use(new ExtraMealsComponent(page));
  },
});
