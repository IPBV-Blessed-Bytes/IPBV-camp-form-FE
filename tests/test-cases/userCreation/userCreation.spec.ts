import { expect, mergeTests } from '@playwright/test';
import { userCreationTest } from 'tests/fixtures/userCreationTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, userCreationTest);

test.describe('Gestão de usuários', () => {
  test('cria, edita e exclui um usuário', async ({ authentication, userCreation }) => {
    const email = 'usuario-crud@test.com';
    await authentication.login(testsConfig.users.adminUser);
    await userCreation.open();

    await userCreation.createUser(email, 'admin');
    await expect(userCreation.createdToast).toBeVisible();
    await expect(userCreation.userRow(email)).toBeVisible();

    await userCreation.editUserRole(email, 'collaborator');
    await expect(userCreation.editedToast).toBeVisible();
    await expect(userCreation.userRow(email)).toBeVisible();

    await userCreation.deleteUser(email);
    await expect(userCreation.deletedToast).toBeVisible();
    await expect(userCreation.userRow(email)).toBeHidden();
  });

  test('não permite criar usuário com e-mail já cadastrado', async ({ authentication, userCreation }) => {
    const email = 'usuario-dup@test.com';
    await authentication.login(testsConfig.users.adminUser);
    await userCreation.open();

    await userCreation.createUser(email, 'admin');
    await expect(userCreation.createdToast).toBeVisible();
    await expect(userCreation.userRow(email)).toBeVisible();

    // Tenta criar de novo com o mesmo e-mail.
    await userCreation.createUser(email, 'admin');
    await expect(userCreation.emailInUseToast).toBeVisible();
    await userCreation.cancelButton.click();

    // Limpa o usuário criado.
    await userCreation.deleteUser(email);
    await expect(userCreation.deletedToast).toBeVisible();
    await expect(userCreation.userRow(email)).toBeHidden();
  });
});
