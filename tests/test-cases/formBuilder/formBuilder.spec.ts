import { expect, mergeTests } from '@playwright/test';
import { formBuilderTest } from 'tests/fixtures/formBuilderTest';
import { adminLoginTest } from 'tests/fixtures/adminLoginTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(formBuilderTest, adminLoginTest);

test.describe('Form builder templates and admin fields flow', () => {
  test('Verify the empty form shows the "Comece com um modelo" template cards', async ({ adminLogin, formBuilder }) => {
    await adminLogin.login(testsConfig.users.adminUser);
    await adminLogin.selectEvent('Retiro de Jovens 2026');

    await formBuilder.gotoFormBuilder();

    await expect(formBuilder.title).toBeVisible();
    await expect(formBuilder.templatesTitle).toBeVisible();
    await expect(formBuilder.acampamentoTemplate).toBeVisible();
    await expect(formBuilder.congressoTemplate).toBeVisible();
    await expect(formBuilder.retiroTemplate).toBeVisible();
  });

  test('Verify the admin fields manager renders for a selected event', async ({ adminLogin, formBuilder }) => {
    await adminLogin.login(testsConfig.users.adminUser);
    await adminLogin.selectEvent('Retiro de Jovens 2026');

    await formBuilder.gotoFieldsManager();

    await expect(formBuilder.fieldsManagerTitle).toBeVisible();
  });
});
