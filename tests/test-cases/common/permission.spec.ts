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

    await expect(permission.registeredCard).toBeVisible();
    await expect(permission.rideCard).toBeVisible();
    await expect(permission.discountCard).toBeVisible();
    await expect(permission.roomsCard).toBeVisible();
    await expect(permission.teamsCard).toBeVisible();
    await expect(permission.feedbackCard).toBeVisible();
    await expect(permission.checkinCard).toBeVisible();

    await expect(permission.validPackagesSection).toBeVisible();
    await expect(permission.totalSection).toBeVisible();
    await expect(permission.managementSection).toBeVisible();
    await expect(permission.dataPanelSection).toBeVisible();

    await permission.registeredCard.click();
    await expect(permission.selectAllColumn).toBeVisible();
    await expect(permission.editDeleteColumn).toBeVisible();
    await expect(permission.newCamperButton).toBeVisible();
  });

  test('Check collaborator permissions', async ({ authentication, permission }) => {
    const collaboratorUser = testsConfig.users.collaboratorUser;

    await authentication.login(collaboratorUser);
    await expect(permission.logoutButton).toBeVisible();

    await expect(permission.registeredCard).toBeVisible();
    await expect(permission.rideCard).toBeVisible();
    await expect(permission.discountCard).toBeVisible();
    await expect(permission.roomsCard).toBeVisible();
    await expect(permission.teamsCard).toBeVisible();
    await expect(permission.feedbackCard).toBeVisible();
    await expect(permission.checkinCard).toBeHidden();

    await expect(permission.validPackagesSection).toBeVisible();
    await expect(permission.totalSection).toBeVisible();
    await expect(permission.managementSection).toBeHidden();
    await expect(permission.dataPanelSection).toBeVisible();

    await permission.registeredCard.click();
    await expect(permission.selectAllColumn).toBeVisible();
    await expect(permission.editDeleteColumn).toBeVisible();
    await expect(permission.newCamperButton).toBeVisible();
  });

  test('Check collaborator viewer permissions', async ({ authentication, permission }) => {
    const collaboratorViewerUser = testsConfig.users.collaboratorViewer;

    await authentication.login(collaboratorViewerUser);
    await expect(permission.logoutButton).toBeVisible();

    await expect(permission.registeredCard).toBeVisible();
    await expect(permission.discountCard).toBeVisible();
    await expect(permission.rideCard).toBeHidden();
    await expect(permission.roomsCard).toBeHidden();
    await expect(permission.teamsCard).toBeHidden();
    await expect(permission.feedbackCard).toBeHidden();
    await expect(permission.checkinCard).toBeHidden();

    await expect(permission.validPackagesSection).toBeVisible();
    await expect(permission.totalSection).toBeVisible();
    await expect(permission.managementSection).toBeHidden();
    await expect(permission.dataPanelSection).toBeVisible();

    await permission.registeredCard.click();
    await expect(permission.selectAllColumn).toBeHidden();
    await expect(permission.editDeleteColumn).toBeHidden();
    await expect(permission.newCamperButton).toBeHidden();
  });

  test('Check checker permissions', async ({ authentication, permission }) => {
    const checkerUser = testsConfig.users.checkerUser;

    await authentication.login(checkerUser);
    await expect(permission.logoutButton).toBeVisible();

    await expect(permission.checkinCard).toBeVisible();
    await expect(permission.registeredCard).toBeHidden();
    await expect(permission.rideCard).toBeHidden();
    await expect(permission.discountCard).toBeHidden();
    await expect(permission.roomsCard).toBeHidden();
    await expect(permission.teamsCard).toBeHidden();
    await expect(permission.feedbackCard).toBeHidden();

    await expect(permission.validPackagesSection).toBeHidden();
    await expect(permission.totalSection).toBeHidden();
    await expect(permission.managementSection).toBeHidden();
    await expect(permission.dataPanelSection).toBeVisible();
  });
});
