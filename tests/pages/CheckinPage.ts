import { Locator, Page } from '@playwright/test';

const CAMPER_CPF = '66666666666';

export class CheckinComponent {
  readonly heading: Locator;
  readonly cpfInput: Locator;
  readonly suggestionItem: Locator;
  readonly userSelectedToast: Locator;
  readonly camperName: Locator;
  readonly birthdayLabel: Locator;
  readonly accommodationLabel: Locator;
  readonly checkinSelect: Locator;
  readonly updateCheckinButton: Locator;
  readonly checkedInToast: Locator;
  readonly checkedOutToast: Locator;

  constructor(readonly page: Page) {
    this.heading = page.locator('.admin-subpage__title', { hasText: 'Check-in' });
    this.cpfInput = page.locator('#cpf');
    this.suggestionItem = page.locator('.cpf-suggestions-item');
    this.userSelectedToast = page.getByText('Usuário selecionado');
    this.camperName = page.locator('.checkin-user__name');
    this.birthdayLabel = page.getByText('Data de Nascimento', { exact: true });
    this.accommodationLabel = page.getByText('Hospedagem', { exact: true });
    this.checkinSelect = page.locator('#checkinStatus');
    this.updateCheckinButton = page.getByRole('button', { name: 'Atualizar Check-in' });
    this.checkedInToast = page.getByText('Check-in realizado com sucesso');
    this.checkedOutToast = page.getByText('Status de Check-in atualizado para não checado');
  }

  async open() {
    await this.page.goto('/admin/checkin', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async searchCamper() {
    await this.cpfInput.click();
    await this.cpfInput.pressSequentially(CAMPER_CPF, { delay: 12 });
    await this.suggestionItem.first().waitFor({ state: 'visible', timeout: 15000 });
    await this.suggestionItem.first().click();
    await this.camperName.waitFor({ state: 'visible', timeout: 15000 });
  }

  async setCheckin(status: 'true' | 'false') {
    await this.checkinSelect.selectOption(status);
    await this.updateCheckinButton.click();
  }
}
