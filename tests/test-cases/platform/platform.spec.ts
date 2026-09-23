import { expect, mergeTests } from '@playwright/test';
import { platformTest } from 'tests/fixtures/platformTest';
import { adminLoginTest } from 'tests/fixtures/adminLoginTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(platformTest, adminLoginTest);

test.describe('Platform owner panel flow', () => {
  test('Verify the platform owner panel renders for the owner', async ({ adminLogin, platform }) => {
    await adminLogin.login(testsConfig.users.adminUser);

    await platform.goto();

    await expect(platform.title).toBeVisible();

    await expect(platform.organizationsStat).toBeVisible();
    await expect(platform.eventsStat).toBeVisible();
    await expect(platform.registrationsStat).toBeVisible();
    await expect(platform.usersStat).toBeVisible();

    await expect(platform.pricingHeading).toBeVisible();
    await expect(platform.feePercentLabel).toBeVisible();
    await expect(platform.freeEventFeeLabel).toBeVisible();
    await expect(platform.freeEventAnnualLabel).toBeVisible();
    await expect(platform.savePricingButton).toBeVisible();

    await expect(platform.organizationsTable).toBeVisible();
    await expect(platform.ipbvOrgCell).toBeVisible();

    await expect(platform.storeFaqsHeading).toBeVisible();
  });

  test('Verify the "Nova organização" modal opens with its fields', async ({ adminLogin, platform }) => {
    await adminLogin.login(testsConfig.users.adminUser);

    await platform.goto();
    await expect(platform.title).toBeVisible();

    await platform.openNewOrganizationModal();

    await expect(platform.modal).toBeVisible();
    await expect(platform.modalNameLabel).toBeVisible();
    await expect(platform.modalSlugLabel).toBeVisible();

    await platform.closeModal();
    await expect(platform.modal).toBeHidden();
  });
});
