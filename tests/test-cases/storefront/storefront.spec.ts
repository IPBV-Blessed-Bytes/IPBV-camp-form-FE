import { expect } from '@playwright/test';
import { storefrontTest as test } from 'tests/fixtures/storefrontTest';

test.describe('Storefront flow', () => {
  test('Verify the public storefront renders pricing and the signup form', async ({ storefront }) => {
    await storefront.goto();

    await expect(storefront.heroTitle).toBeVisible();
    await expect(storefront.plansSectionTitle).toBeVisible();

    await expect(storefront.paidPlanName).toBeVisible();
    await expect(storefront.paidPlanPrice).toContainText('%');

    await expect(storefront.freePlanName).toBeVisible();
    await expect(storefront.freePlanPrice).toContainText('R$');

    await expect(storefront.noMonthlyPlanName).toBeVisible();
    await expect(storefront.noMonthlyPlanPrice).toContainText('R$');

    await expect(storefront.churchNameInput).toBeVisible();
    await expect(storefront.slugInput).toBeVisible();
    await expect(storefront.adminNameInput).toBeVisible();
    await expect(storefront.adminEmailInput).toBeVisible();
    await expect(storefront.adminPasswordInput).toBeVisible();
    await expect(storefront.submitButton).toBeVisible();
  });

  test('Verify client-side validation fires on empty submit', async ({ storefront }) => {
    await storefront.goto();

    await expect(storefront.submitButton).toBeVisible();
    await storefront.submitButton.click();

    await expect(storefront.churchNameError).toBeVisible();
  });
});
