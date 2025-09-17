import { expect } from '@playwright/test';
import { formTest as test } from 'tests/fixtures/formTest';

test.describe('Form flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', {
      waitUntil: 'commit',
    });
  });

  test('Verify if it is possible to create an order for a paying adult', async ({ form }) => {
    await expect(form.formTitle).toBeVisible();
    await form.forwardButton.click();

    await expect(form.personalInfoHeading).toBeVisible();
    await form.fillFormFields('Test Test', form.nameField, 'text');
    await form.fillFormFields('Homem', form.genderField, 'select');
    await form.fillFormFields('10/10/1959', form.birthdayField, 'text');
    await form.fillFormFields('745.106.734-34', form.cpfField, 'text');
    await form.fillFormFields('0000000', form.rgField, 'text');
    await form.fillFormFields('Outro', form.rgShipperField, 'select');
    await form.fillFormFields('SP', form.rgShipperStateField, 'select');
    await form.forwardButton.click();

    await expect(form.contactHeading).toBeVisible();
    await form.fillFormFields('(00) 00000-00000', form.cellphoneField, 'text');
    await form.fillFormFields('Não', form.isWhatsappField, 'select');
    await form.fillFormFields('test@test.com', form.emailField, 'text');
    await form.fillFormFields('IP. Boa Viagem', form.churchField, 'select');
    await form.fillFormFields('Sim', form.carField, 'select');
    await form.fillFormFields('3', form.numberVacanciesField, 'select');
    await form.fillFormFields('pouca mala', form.rideObservationField, 'text');
    await form.fillFormFields('Sim', form.hasAllergyField, 'select');
    await form.fillFormFields('alergia', form.allergyField, 'text');
    await form.fillFormFields('Sim', form.hasAgregateField, 'select');
    await form.fillFormFields('acompanhante 1, acompanhante 2', form.aggregateField, 'text');
    await form.forwardButton.click();

    await expect(form.packagesHeading).toBeVisible();
    await form.accomodationAccordion.click();
    await form.packageField.click();
    await form.forwardButton.click();

    await expect(form.finalReviewHeading).toBeVisible();
    for (let i = 0; i < form.finalReviewItems.length; i++) {
      const section = form.finalReviewItems[i];
      await expect(section).toBeVisible();
    }

    await expect(form.confirmDataText).toBeVisible();
    await form.confirmDataCheckbox.check();
    await form.forwardButton.click();

    await expect(form.PaymentHeading).toBeVisible();
    await form.fillFormFields('creditCard', form.formPaymentField, 'select');
    await form.forwardButton.click();

    // const newTabPromise = page.waitForEvent('popup');
    // const newTab = await newTabPromise;

    // const pagarmeUrl = 'https://checkout.pagar.me/'
    // await expect(newTab).toHaveURL(pagarmeUrl);
    // await expect(form.pagarmeReference).toBeVisible();
  });

  test.skip('Verify if it is possible to create an order for a non-paying adult', async ({ form }) => {});
});
