import { expect, mergeTests } from '@playwright/test';
import { rolesTest } from 'tests/fixtures/rolesTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(rolesTest, authenticationTest);

test.describe('Gestão de papéis', () => {
  test('cria, edita e exclui um papel', async ({ authentication, roles }) => {
    await authentication.login(testsConfig.users.adminUser);
    await roles.open();

    await roles.createRole();
    await expect(roles.createdToast).toBeVisible();
    await expect(roles.createdRow()).toBeVisible();

    await expect(roles.modalBackdrop).toHaveCount(0);
    await expect(roles.createNewRoleButton).toBeEnabled();

    await roles.editRole();
    await expect(roles.updatedToast).toBeVisible();
    await expect(roles.createdRow()).toBeVisible();

    await expect(roles.modalBackdrop).toHaveCount(0);

    await roles.deleteRole();
    await expect(roles.deletedToast).toBeVisible();
    await expect(roles.createdRow()).toBeHidden();
  });
});
