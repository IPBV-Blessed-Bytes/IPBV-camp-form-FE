import { Locator, Page } from '@playwright/test';

export class CheckRegistrationComponent {
  readonly infoButton: Locator;
  readonly verifyRegistrationButton: Locator;
  readonly verifyRegistrationHeading: Locator;
  readonly cpfInput: Locator;
  readonly birthdayInput: Locator;
  readonly checkButton: Locator;
  readonly verifyDataHeading: Locator;
  readonly dataInputs: Locator[];
  readonly backButton: Locator;

  constructor(readonly page: Page) {
    this.infoButton = page.getByTestId('info-button');
    this.verifyRegistrationButton = page.getByTestId('info-menu-verify-registration');
    this.verifyRegistrationHeading = page.getByText('Consulte Status da sua Inscrição');
    this.cpfInput = page.locator('#cpf');
    this.birthdayInput = page.locator('#birthDay');
    this.checkButton = page.getByRole('button', { name: 'Consultar' });
    this.verifyDataHeading = page.getByText('Consulta de Dados');
    this.dataInputs = [
      page.getByText('Nome:', { exact: false }),
      page.getByText('Acompanhantes:', { exact: false }),
      page.getByText('Tipo de Pagamento:', { exact: false }),
      page.getByText('Cadastrado em:', { exact: false }),
      page.getByText('Hospedagem:', { exact: false }),
      page.getByText('Alimentação:', { exact: false }),
      page.getByText('Transporte:', { exact: false }),
      page.getByText('Alergia:', { exact: false }),
      page.getByText('Tem vaga de carona:', { exact: false }),
      page.getByText('Precisa de carona:', { exact: false }),
      page.getByText('Preço:', { exact: false }),
    ];
    this.backButton = page.getByRole('button', { name: 'Voltar' });
  }

  async openVerifyRegistrationPage() {
    await this.infoButton.click();
    await this.verifyRegistrationButton.click();
  }

  async fillCamperData(cpf: string = '70448691493', birthday: string = '29/11/2000') {
    await this.cpfInput.fill(cpf);
    await this.birthdayInput.fill(birthday);
    await this.birthdayInput.press('Escape');
    await this.checkButton.click();
  }
}
