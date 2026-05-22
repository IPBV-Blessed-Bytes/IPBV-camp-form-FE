import { expect, mergeTests } from '@playwright/test';
import { camperTableTest } from 'tests/fixtures/camperTableTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, camperTableTest);

test.describe('Camper table flow', () => {
  test('Navigates to campers table and verifies key columns and toolbar', async ({ authentication, camperTable }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);
    await camperTable.navigateToCampersTable();

    await expect(camperTable.heading).toBeVisible();
    await expect(camperTable.table).toBeVisible();

    await expect(camperTable.selectAllColumn).toBeVisible();
    await expect(camperTable.nameColumn).toBeVisible();
    await expect(camperTable.cpfColumn).toBeVisible();
    await expect(camperTable.checkinColumn).toBeVisible();
    await expect(camperTable.editDeleteColumn).toBeVisible();

    await expect(camperTable.newCamperButton).toBeVisible();
    await expect(camperTable.downloadReportButton).toBeVisible();
    await expect(camperTable.toggleFiltersButton).toBeVisible();
  });

  test('Toggles filters and renders filter row', async ({ authentication, camperTable, page }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);
    await camperTable.navigateToCampersTable();
    await expect(camperTable.heading).toBeVisible();

    await camperTable.toggleFilters();
    await expect(page.locator('tr.filter')).toBeVisible();

    await camperTable.toggleFilters();
    await expect(page.locator('tr.filter')).toBeHidden();
  });
});
