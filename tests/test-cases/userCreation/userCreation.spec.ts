import { expect, mergeTests } from '@playwright/test';
import { userCreationTest } from 'tests/fixtures/userCreationTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';

import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, userCreationTest);

test.describe('User Creation number flow', () => {
  test('Verify if it is possible to create, edit and delete a user', async ({ authentication, userCreation }) => {
    await authentication.goToAdminPage();

    const adminPassword = testsConfig.users.testUser;
    await authentication.login(adminPassword);

    await userCreation.openUsersManagementPage();
    await expect(userCreation.usersManagementHeading).toBeVisible();
    await userCreation.createNewUserButton.click();
    await expect(userCreation.createUserHeading).toBeVisible();
    await userCreation.fillUserData();
    await expect(userCreation.userSuccessfulyCreatedToast).toBeVisible();
    await expect(userCreation.userCreated).toBeVisible();

    await userCreation.editUserButton.click();
    await expect(userCreation.editUserHeading).toBeVisible();
    await expect(userCreation.obsEditUser).toBeVisible();
    await userCreation.editUserData();
    await expect(userCreation.userSuccessfulyEditedToast).toBeVisible();
    await expect(userCreation.userCreated).toBeHidden();
    await expect(userCreation.userUpdated).toBeVisible();

    await userCreation.deleteUserButton.click();
    await expect(userCreation.deleteUserHeading).toBeVisible();
    await userCreation.confirmDeleteUserButton.click();
    await expect(userCreation.userSuccessfulyDeletedToast).toBeVisible();
    await expect(userCreation.userCreated).toBeHidden();
    await expect(userCreation.userUpdated).toBeHidden();
  });

  test('Verify if it is not possible to create a user with an existing username', async ({
    authentication,
    userCreation,
  }) => {
    await authentication.goToAdminPage();

    const adminPassword = testsConfig.users.testUser;
    await authentication.login(adminPassword);

    await userCreation.openUsersManagementPage();
    await expect(userCreation.usersManagementHeading).toBeVisible();
    await userCreation.createNewUserButton.click();
    await expect(userCreation.createUserHeading).toBeVisible();
    await userCreation.fillUserData();
    await expect(userCreation.userSuccessfulyCreatedToast).toBeVisible();
    await expect(userCreation.userCreated).toBeVisible();

    await userCreation.createNewUserButton.click();
    await userCreation.fillUserData();
    await expect(userCreation.usernameAlreadyUsedToast).toBeVisible();
    await expect(userCreation.createUserHeading).toBeVisible();
    await userCreation.modalCloseButton.click();

    await userCreation.deleteUserDuplicatedButton.click();
    await expect(userCreation.deleteUserHeading).toBeVisible();
    await userCreation.confirmDeleteUserButton.click();
    await expect(userCreation.userSuccessfulyDeletedToast).toBeVisible();
    await expect(userCreation.userCreated).toBeHidden();
    await expect(userCreation.userUpdated).toBeHidden();
  });
});
