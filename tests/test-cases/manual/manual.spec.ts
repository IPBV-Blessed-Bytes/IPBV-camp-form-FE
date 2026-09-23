import { expect, mergeTests } from '@playwright/test';
import { manualTest } from 'tests/fixtures/manualTest';
import { adminLoginTest } from 'tests/fixtures/adminLoginTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(manualTest, adminLoginTest);

test.describe('In-app Manual flow', () => {
  test('Verify the owner sees the four manual tabs and can switch between them', async ({ adminLogin, manual }) => {
    await adminLogin.login(testsConfig.users.adminUser);
    await adminLogin.selectEvent('Acampamento IPBV');

    await manual.goto();

    await expect(manual.title).toBeVisible();

    await expect(manual.clientTab).toBeVisible();
    await expect(manual.ownerTab).toBeVisible();
    await expect(manual.architectureTab).toBeVisible();
    await expect(manual.salesTab).toBeVisible();

    await expect(manual.subnavTitle).toBeVisible();
    await expect(manual.subnavLinks.first()).toBeVisible();

    await expect(manual.clientDefaultHeading).toBeVisible();

    await manual.architectureTab.click();
    await expect(manual.architectureStackHeading).toBeVisible();

    await manual.salesTab.click();
    await expect(manual.salesPricesHeading).toBeVisible();
  });
});
