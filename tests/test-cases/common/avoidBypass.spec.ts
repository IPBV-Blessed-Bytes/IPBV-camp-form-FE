import { expect, mergeTests } from '@playwright/test';
import { commonTest } from 'tests/fixtures/commonTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(commonTest, authenticationTest);

test.describe('Avoid Bypass', () => {
  test('Check that it is not possible to enter an admin route without being logged into the system', async ({
    avoidBypass,
  }) => {
    await avoidBypass.goToAllowedPage();
    await expect(avoidBypass.adminAccess).toBeVisible();
    await expect(avoidBypass.logOutButon).toBeHidden();
  });

  test('Check that you cannot enter an admin route while logged into the system if you do not have permission', async ({
    page,
    avoidBypass,
    authentication,
  }) => {
    const checkerUser = testsConfig.users.checkerUser;

    await authentication.login(checkerUser);
    // login concluído (some o botão da tela de login), independente do papel
    await expect(page.getByRole('button', { name: 'Acessar Painel' })).toBeHidden();
    await avoidBypass.goToAllowedPage();
    await page.waitForLoadState('networkidle');
    await expect(avoidBypass.checkinPageHeading).toBeVisible();
    await avoidBypass.goToPageNotAllowed();
    await expect(avoidBypass.dontHavePermission).toBeVisible();
    await expect(avoidBypass.campersPageHeading).toBeHidden();
  });
});
