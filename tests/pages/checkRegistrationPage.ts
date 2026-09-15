import { Locator, Page } from '@playwright/test';

export class CheckRegistrationComponent {
  readonly cpfInput: Locator;
  readonly birthdayInput: Locator;
  readonly checkButton: Locator;
  readonly verifyDataHeading: Locator;
  readonly backButton: Locator;
  readonly dataInputs: Locator[];

  constructor(readonly page: Page) {
    this.cpfInput = page.locator('#cpf');
    this.birthdayInput = page.locator('#birthDay');
    this.checkButton = page.getByRole('button', { name: 'Consultar' });
    this.verifyDataHeading = page.getByText('Consulta de Dados');
    this.backButton = page.getByRole('button', { name: 'Voltar' });
    this.dataInputs = [
      page.getByText('Nome:'),
      page.getByText('Hospedagem:'),
      page.getByText('Transporte:'),
      page.getByText('Preço:'),
      page.getByText('Cadastrado em:'),
    ];
  }

  async openVerifyRegistrationPage() {
    await this.page.goto('/verificacao', { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('button', { name: 'Ciente' }).click({ timeout: 3000 }).catch(() => {});
    await this.checkButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillCamperData(cpf: string, birthday: string) {
    await this.cpfInput.click();
    await this.cpfInput.pressSequentially(cpf, { delay: 12 });
    await this.birthdayInput.fill(birthday);
    await this.birthdayInput.press('Enter');
    await this.page.waitForTimeout(300);
    await this.checkButton.click();
  }
}
