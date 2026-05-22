import { expect } from '@playwright/test';
import { formTest as test } from 'tests/fixtures/formTest';

test.describe('Form flow - Children', () => {
  test('Fills personal data with legal guardian fields for a minor', async ({ form }) => {
    await form.goToForm();
    await form.dismissLgpdModal();
    await form.advanceToPersonalData();
    await expect(form.personalDataHeading).toBeVisible();

    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const dd = String(tenYearsAgo.getDate()).padStart(2, '0');
    const mm = String(tenYearsAgo.getMonth() + 1).padStart(2, '0');
    const yyyy = tenYearsAgo.getFullYear();
    const birthday = `${dd}/${mm}/${yyyy}`;

    await form.cpfInput.fill('52998224725');
    await form.birthdayInput.fill(birthday);
    await form.birthdayInput.press('Tab');

    await expect(form.ageConfirmationModal).toBeVisible({ timeout: 10_000 });
    await form.ageConfirmationConfirmButton.click();
    await expect(form.ageConfirmationModal).toBeHidden();

    await form.nameInput.fill('Teste Playwright Criança');

    await expect(form.legalGuardianNameInput).toBeVisible({ timeout: 10_000 });
    await form.legalGuardianNameInput.fill('Responsável Teste');
    await form.legalGuardianCpfInput.fill('39053344705');
    await form.legalGuardianCellPhoneInput.fill('81999999999');

    await expect(form.legalGuardianNameInput).toHaveValue('Responsável Teste');
    await expect(form.personalDataHeading).toBeVisible();
  });
});
