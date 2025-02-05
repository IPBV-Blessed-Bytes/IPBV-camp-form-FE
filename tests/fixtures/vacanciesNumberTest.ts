import { test } from '@playwright/test';
import { VacanciesNumberComponent } from 'tests/pages/VacanciesNumberPage';

interface VacanciesNumberTest {
  vacanciesNumber: VacanciesNumberComponent;
}

export const vacanciesNumberTest = test.extend<VacanciesNumberTest>({
  vacanciesNumber: async ({ page }, use) => {
    await use(new VacanciesNumberComponent(page));
  },
});
