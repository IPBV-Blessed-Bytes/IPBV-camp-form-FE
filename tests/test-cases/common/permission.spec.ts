import { expect, mergeTests } from '@playwright/test';
import { commonTest } from 'tests/fixtures/commonTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(commonTest, authenticationTest);

test.describe('Permissions flow', () => {
  test.beforeEach(async ({ authentication }) => {
    await authentication.goToAdminPage();
  });

  test('Check admin permissions', async ({ authentication, permission }) => {
    const adminUser = testsConfig.users.adminUser;

    await authentication.login(adminUser);
    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.allAdminCards).toBeVisible();
    await expect(permission.packagesSession).toBeVisible();
    await expect(permission.totalSession).toBeVisible();
    await expect(permission.managementSession).toBeVisible();
    await expect(permission.dataPanelSession).toBeVisible();
    await permission.registeredButton.click();
    await expect(permission.selectAllColumn).toBeVisible();
    await expect(permission.editDeleteColumn).toBeVisible();
    await expect(permission.newCamperButton).toBeVisible();
  });

  test('Check collaborator permissions', async ({ authentication, permission }) => {
    const collaboratorUser = testsConfig.users.collaboratorUser;

    await authentication.login(collaboratorUser);
    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.allAdminCards).toBeHidden();
    await expect(permission.allAdminCardsWithoutCheckin).toBeVisible();
    await expect(permission.packagesSession).toBeVisible();
    await expect(permission.totalSession).toBeVisible();
    await expect(permission.managementSession).toBeHidden();
    await expect(permission.dataPanelSession).toBeVisible();
    await permission.registeredButton.click();
    await expect(permission.selectAllColumn).toBeVisible();
    await expect(permission.editDeleteColumn).toBeVisible();
    await expect(permission.newCamperButton).toBeVisible();
  });

  test('Check collaboratorUser viewer permissions', async ({ authentication, permission }) => {
    const collaboratorViewerUser = testsConfig.users.collaboratorViewer;

    await authentication.login(collaboratorViewerUser);
    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.allAdminCards).toBeHidden();
    await expect(permission.registeredAndDiscountCards).toBeVisible();
    await expect(permission.packagesSession).toBeVisible();
    await expect(permission.totalSession).toBeVisible();
    await expect(permission.managementSession).toBeHidden();
    await expect(permission.dataPanelSession).toBeVisible();
    await permission.registeredButton.click();
    await expect(permission.selectAllColumn).toBeHidden();
    await expect(permission.editDeleteColumn).toBeHidden();
    await expect(permission.newCamperButton).toBeHidden();
  });

  test('Check checker permissions', async ({ authentication, permission }) => {
    const checkerUser = testsConfig.users.checkerUser;

    await authentication.login(checkerUser);
    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.allAdminCards).toBeHidden();
    await expect(permission.justCheckinCard).toBeVisible();
    await expect(permission.packagesSession).toBeHidden();
    await expect(permission.totalSession).toBeHidden();
    await expect(permission.managementSession).toBeHidden();
    await expect(permission.dataPanelSession).toBeVisible();
  });
});
