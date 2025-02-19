import { expect, mergeTests } from '@playwright/test';
import { extraMealsTest } from 'tests/fixtures/extraMealsTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, extraMealsTest);

test.describe('Extra Meals flow', () => {
  test('Verify if it is possible to view extra meals previously created', async ({ authentication, extraMeals }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);

    await extraMeals.extraMealsButton.click();
    await expect(extraMeals.extraMealsHeading).toBeVisible();
    await expect(extraMeals.extraMealsTable).toBeVisible();
    await expect(extraMeals.tableCamperColumn).toBeVisible();
    await expect(extraMeals.tableDaysColumn).toBeVisible();
  });
});
