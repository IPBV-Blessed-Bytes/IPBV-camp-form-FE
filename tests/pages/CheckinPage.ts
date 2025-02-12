import { Locator, Page } from '@playwright/test';

export class CheckinComponent {
  readonly registeredButton: Locator;
  readonly registeredHeading: Locator;
  readonly checkinFieldInTheCampersTable: Locator;
  readonly backButton: Locator;
  readonly checkinButton: Locator;
  readonly checkinHeading: Locator;
  readonly cpfInput: Locator;
  readonly searchUserButton: Locator;
  readonly colorStatus: Locator;
  readonly nameField: Locator;
  readonly packageField: Locator;
  readonly paymentField: Locator;
  readonly valueField: Locator;
  readonly birthdayField: Locator;
  readonly accomodationField: Locator;
  readonly subAccomodationField: Locator;
  readonly roomField: Locator;
  readonly foodField: Locator;
  readonly extraMealsField: Locator;
  readonly checkinSelect: Locator;
  readonly updateCheckinButton: Locator;
  readonly checkinSuccessfulyUpdatedToast: Locator;
  readonly checkinUpdatedToFalseToast: Locator;
  readonly checkinItems: Locator[];

  constructor(readonly page: Page) {
    this.registeredButton = page.getByText('Inscritos', { exact: true });
    this.registeredHeading = page.getByRole('heading', { name: 'Gerenciamento de Inscritos' });
    this.checkinFieldInTheCampersTable = page.locator('table tbody tr:first-child td:nth-of-type(29)');

    this.backButton = page.getByRole('button', { name: 'Voltar' });
    this.checkinButton = page.getByText('Check-in', { exact: true });
    this.checkinHeading = page.getByRole('heading', { name: 'Check-in de Usuário' });
    this.cpfInput = page.getByRole('spinbutton', { name: 'CPF do Usuário:' });
    this.searchUserButton = page.getByRole('button', { name: 'Buscar Usuário' });
    this.colorStatus = page.locator('.checkin-color-status-wrapper__line');
    this.nameField = page.getByText('Nome: Yuri Galeno Pinheiro');
    this.packageField = page.getByText('Pacote: PACOTE 14 -');
    this.paymentField = page.getByText('Forma de Pagamento: Cartão de');
    this.valueField = page.getByText('Valor do Pagamento: 208');
    this.birthdayField = page.getByText('Data de Nascimento: 23/10/');
    this.accomodationField = page.getByText('Acomodação: Outra Acomodacao');
    this.subAccomodationField = page.getByText('Sub Acomodação: Outra');
    this.roomField = page.getByText('Quarto: Não alocado');
    this.foodField = page.getByText('Alimentação: Almoco e jantar');
    this.extraMealsField = page.getByText('Dias de Refeição Extra:');
    this.checkinItems = [
      this.colorStatus,
      this.nameField,
      this.packageField,
      this.paymentField,
      this.valueField,
      this.birthdayField,
      this.accomodationField,
      this.subAccomodationField,
      this.roomField,
      this.foodField,
      this.extraMealsField,
    ];
    this.checkinSelect = page.getByLabel('Check-in realizado?');
    this.updateCheckinButton = page.getByRole('button', { name: 'Atualizar Check-in' });
    this.checkinSuccessfulyUpdatedToast = page.getByText('Check-in realizado com sucesso');
    this.checkinUpdatedToFalseToast = page.getByText('Status de Check-in atualizado para não checado');
  }

  async backAndGoToCheckinPage() {
    await this.backButton.click();
    await this.checkinButton.click();
  }

  async backAndGoToRegisteredPage() {
    await this.backButton.click();
    await this.registeredButton.click();
  }

  async findUser() {
    await this.cpfInput.fill('03561746462');
    await this.searchUserButton.click();
  }

  async checkinSelectToggle(option: string) {
    await this.checkinSelect.selectOption(option);
    await this.updateCheckinButton.click();
  }
}
