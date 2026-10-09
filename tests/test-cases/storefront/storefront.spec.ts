import { expect } from '@playwright/test';
import { storefrontTest as test } from 'tests/fixtures/storefrontTest';

test.describe('Storefront flow', () => {
  test('Verify the public storefront renders the signup form', async ({ storefront }) => {
    await storefront.goto();

    await expect(storefront.heroTitle).toBeVisible();

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
