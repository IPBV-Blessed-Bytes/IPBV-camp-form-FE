import { expect } from '@playwright/test';
import { formTest as test } from 'tests/fixtures/formTest';

test.describe('Form flow - Adult', () => {
  test('Fills home → personal data → contact pages without submitting', async ({ form, page }) => {
    await form.goToForm();
    await expect(form.lgpdModal).toBeVisible();
    await form.dismissLgpdModal();

    await expect(form.advanceButton).toBeVisible();
    await form.advanceToPersonalData();

    await expect(form.personalDataHeading).toBeVisible();
    await form.fillPersonalData({
      cpf: '11144477735',
      birthday: '15/05/1990',
      name: 'Teste Playwright Adulto',
      rg: '1234567',
      rgShipper: 'SSP',
      rgShipperState: 'PE',
      gender: 'Homem',
    });

    await expect(form.cpfInput).toHaveValue('111.444.777-35');
    await expect(form.nameInput).toHaveValue('Teste Playwright Adulto');

    await expect(form.personalDataHeading).toBeVisible();
  });

  test('Shows validation when required fields are empty', async ({ form, page }) => {
    await form.goToForm();
    await form.dismissLgpdModal();
    await form.advanceToPersonalData();
    await expect(form.personalDataHeading).toBeVisible();

    await form.advanceButton.click();

    await expect(page.getByText(/Informe|Selecione/i).first()).toBeVisible();
  });
});
