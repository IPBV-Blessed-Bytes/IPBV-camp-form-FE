import { Locator, Page } from '@playwright/test';

export class CheckinComponent {
  readonly registeredButton: Locator;
  readonly registeredHeading: Locator;
  readonly checkinCellInFirstCampersRow: Locator;
  readonly backButton: Locator;
  readonly checkinButton: Locator;
  readonly checkinHeading: Locator;
  readonly cpfInput: Locator;
  readonly colorStatus: Locator;
  readonly nameField: Locator;
  readonly paymentField: Locator;
  readonly valueField: Locator;
  readonly birthdayField: Locator;
  readonly accommodationField: Locator;
  readonly roomField: Locator;
  readonly foodField: Locator;
  readonly teamField: Locator;
  readonly checkinSelect: Locator;
  readonly updateCheckinButton: Locator;
  readonly checkinSuccessfulyUpdatedToast: Locator;
  readonly checkinUpdatedToFalseToast: Locator;
  readonly checkinItems: Locator[];

  constructor(readonly page: Page) {
    this.registeredButton = page.getByTestId('session-card-registered-card');
    this.registeredHeading = page.getByRole('heading', { name: 'Gerenciamento de Inscritos' });
    this.checkinCellInFirstCampersRow = page
      .getByTestId('campers-row-0')
      .getByTestId('campers-cell-checkin');

    this.backButton = page.getByTestId('admin-header-back');
    this.checkinButton = page.getByTestId('session-card-checkin-card');
    this.checkinHeading = page.getByRole('heading', { name: 'Check-in de Usuário' });
    this.cpfInput = page.getByTestId('checkin-cpf-input');
    this.colorStatus = page.locator('.checkin-color-status-wrapper__line').first();

    this.nameField = page.getByTestId('checkin-field-name');
    this.paymentField = page.getByTestId('checkin-field-payment');
    this.valueField = page.getByTestId('checkin-field-value');
    this.birthdayField = page.getByTestId('checkin-field-birthday');
    this.accommodationField = page.getByTestId('checkin-field-accommodation');
    this.roomField = page.getByTestId('checkin-field-room');
    this.foodField = page.getByTestId('checkin-field-food');
    this.teamField = page.getByTestId('checkin-field-team');

    this.checkinItems = [
      this.nameField,
      this.paymentField,
      this.valueField,
      this.birthdayField,
      this.accommodationField,
      this.roomField,
      this.foodField,
      this.teamField,
    ];

    this.checkinSelect = page.getByTestId('checkin-status-select');
    this.updateCheckinButton = page.getByTestId('checkin-submit');
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

  async findUser(cpf: string = '03561746462') {
    await this.cpfInput.fill(cpf);
    await this.page.getByTestId(`checkin-suggestion-${cpf}`).click();
  }

  async checkinSelectToggle(option: string) {
    await this.checkinSelect.selectOption(option);
    await this.updateCheckinButton.click();
  }
}
