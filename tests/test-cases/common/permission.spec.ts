import { expect, mergeTests } from '@playwright/test';
import { commonTest } from 'tests/fixtures/commonTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(commonTest, authenticationTest);

test.describe('Permissions flow', () => {
  test('Check admin permissions', async ({ authentication, permission }) => {
    await authentication.login(testsConfig.users.adminUser);
    await authentication.selectEvent('acampamento-ipbv');

    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.configuracoesCard).toBeVisible();
    await expect(permission.inscricoesCard).toBeVisible();
    await expect(permission.caronasCard).toBeVisible();
    await expect(permission.descontosCard).toBeVisible();
    await expect(permission.quartosCard).toBeVisible();
    await expect(permission.timesCard).toBeVisible();
    await expect(permission.feedbacksCard).toBeVisible();
    await expect(permission.checkinCard).toBeVisible();
    await expect(permission.packagesSession).toBeVisible();
    await expect(permission.totalSession).toBeVisible();
  });

  test('Check collaborator permissions', async ({ authentication, permission }) => {
    await authentication.login(testsConfig.users.collaboratorUser);
    await authentication.selectEvent('acampamento-ipbv');

    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.configuracoesCard).toBeHidden();
    await expect(permission.checkinCard).toBeHidden();
    await expect(permission.inscricoesCard).toBeVisible();
    await expect(permission.caronasCard).toBeVisible();
    await expect(permission.descontosCard).toBeVisible();
    await expect(permission.quartosCard).toBeVisible();
    await expect(permission.timesCard).toBeVisible();
    await expect(permission.feedbacksCard).toBeVisible();
    await expect(permission.packagesSession).toBeVisible();
    await expect(permission.totalSession).toBeVisible();
  });

  test('Check collaboratorUser viewer permissions', async ({ authentication, permission }) => {
    await authentication.login(testsConfig.users.collaboratorViewer);
    await authentication.selectEvent('acampamento-ipbv');

    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.configuracoesCard).toBeHidden();
    await expect(permission.inscricoesCard).toBeVisible();
    await expect(permission.descontosCard).toBeVisible();
    await expect(permission.caronasCard).toBeHidden();
    await expect(permission.quartosCard).toBeHidden();
    await expect(permission.timesCard).toBeHidden();
    await expect(permission.feedbacksCard).toBeHidden();
    await expect(permission.checkinCard).toBeHidden();
    await expect(permission.packagesSession).toBeVisible();
    await expect(permission.totalSession).toBeVisible();
  });

  test('Check checker permissions', async ({ authentication, permission }) => {
    await authentication.login(testsConfig.users.checkerUser);
    await authentication.selectEvent('acampamento-ipbv');

    await expect(permission.logoutButton).toBeVisible();
    await expect(permission.checkinCard).toBeVisible();
    await expect(permission.configuracoesCard).toBeHidden();
    await expect(permission.inscricoesCard).toBeHidden();
    await expect(permission.descontosCard).toBeHidden();
  });
});
