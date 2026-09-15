import { expect } from '@playwright/test';
import { checkRegistrationTest as test } from 'tests/fixtures/checkRegistrationTest';

test.describe('Consulta de inscrição', () => {
  test('consulta os dados de uma inscrição existente por CPF e nascimento', async ({ checkRegistration }) => {
    await checkRegistration.openVerifyRegistrationPage();

    await checkRegistration.fillCamperData('66666666666', '22/07/2001');

    await expect(checkRegistration.verifyDataHeading).toBeVisible();
    for (const field of checkRegistration.dataInputs) {
      await expect(field.first()).toBeVisible();
    }

    await checkRegistration.backButton.first().click();
    await expect(checkRegistration.checkButton).toBeVisible();
  });
});
