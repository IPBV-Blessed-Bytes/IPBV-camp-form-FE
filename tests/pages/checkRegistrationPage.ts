import { Locator, Page } from '@playwright/test';

export class CheckRegistrationComponent {
  readonly infoButton: Locator;
  readonly ageToast: Locator;
  readonly verifyRegistrationButton: Locator;
  readonly verifyRegistrationHeading: Locator;
  readonly cpfInput: Locator;
  readonly birthdayInput: Locator;
  readonly checkButton: Locator;
  readonly verifyDataHeading: Locator;
  readonly dataInputs: Locator[];
  readonly backButton: Locator;

  constructor(readonly page: Page) {
    this.infoButton = page.getByRole('button').filter({ hasText: /^$/ });
    this.ageToast = page.getByRole('button', { name: 'close' });
    this.verifyRegistrationButton = page.getByRole('button', { name: 'Verificar Inscrição' });
    this.verifyRegistrationHeading = page.getByText('Consulte Status da sua Inscrição');
    this.cpfInput = page.getByRole('textbox', { name: 'Preencher CPF válido' });
    this.birthdayInput = page.getByRole('textbox', { name: 'dd/mm/aaaa' });
    this.checkButton = page.getByRole('button', { name: 'Consultar' });
    this.verifyDataHeading = page.getByText('Consulta de Dados');
    this.dataInputs = [
      page.getByText('Nome:'),
      page.getByText('Acompanhantes:'),
      page.getByText('Status de Pagamento:'),
      page.getByText('Cadastrado em:'),
      page.getByText('Categoria do Pacote:'),
      page.getByText('Acomodação:'),
      page.getByText('Alimentação:'),
      page.getByText('Alimentação Extra:'),
      page.getByText('Transporte:'),
      page.getByText('Alergia: Nenhuma'),
      page.getByText('Tem vaga de carona:'),
      page.getByText('Precisa de carona:'),
      page.getByText('Preço:'),
    ];
    this.backButton = page.getByRole('button', { name: 'Voltar' });
  }

  async openVerifyRegistrationPage() {
    await this.infoButton.click();
    await this.verifyRegistrationButton.click();
  }

  async fillCamperData() {
    await this.cpfInput.fill('70448691493');
    await this.birthdayInput.fill('29/11/2000');
    await this.checkButton.click();
  }
}
