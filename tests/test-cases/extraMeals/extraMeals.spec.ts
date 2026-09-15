import { expect, mergeTests } from '@playwright/test';
import { extraMealsTest } from 'tests/fixtures/extraMealsTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, extraMealsTest);

test.describe('Refeições extras', () => {
  test('exibe a lista de acampantes com refeições extras', async ({ authentication, extraMeals }) => {
    await authentication.login(testsConfig.users.adminUser);
    await extraMeals.open();

    await expect(extraMeals.heading).toBeVisible();
    await expect(extraMeals.camperColumn).toBeVisible();
    await expect(extraMeals.daysColumn).toBeVisible();
  });
});
