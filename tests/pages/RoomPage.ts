import { Locator, Page } from '@playwright/test';

export class RoomComponent {
  readonly heading: Locator;
  readonly addNewRoomButton: Locator;
  readonly roomNameInput: Locator;
  readonly createRoomButton: Locator;
  readonly createdToast: Locator;
  readonly addedCamperToast: Locator;
  readonly deletedToast: Locator;
  readonly confirmDeleteRoomButton: Locator;
  readonly roomName: string;

  constructor(readonly page: Page) {
    this.heading = page.locator('.admin-subpage__title', { hasText: 'Quartos' });
    this.addNewRoomButton = page.getByRole('button', { name: 'Adicionar Novo Quarto' });
    this.roomNameInput = page.getByPlaceholder('Nome do novo quarto');
    this.createRoomButton = page.getByRole('button', { name: 'Criar Quarto' });
    this.createdToast = page.getByText('Quarto criado com sucesso');
    this.addedCamperToast = page.getByText('Acampante adicionado ao quarto');
    this.deletedToast = page.getByText('Quarto excluido com sucesso');
    this.confirmDeleteRoomButton = page.locator('.modal.show').getByRole('button', { name: 'Excluir', exact: true });
    this.roomName = `Quarto Teste ${Date.now()}`;
  }

  roomItem = (): Locator =>
    this.page.locator('.accordion-item').filter({ hasText: this.roomName });

  roomHeader = (): Locator => this.roomItem().getByRole('button', { name: this.roomName });

  async open() {
    await this.page.goto('/admin/quartos', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async createRoom() {
    await this.addNewRoomButton.click();
    await this.roomNameInput.waitFor({ state: 'visible' });
    await this.roomNameInput.fill(this.roomName);
    await this.createRoomButton.click();
  }

  async addFirstCamper() {
    await this.roomHeader().click();
    const item = this.roomItem();
    const select = item.locator('select');
    await select.waitFor({ state: 'visible' });
    await select.selectOption({ index: 1 });
    await item.getByRole('button', { name: 'Adicionar ao Quarto' }).click();
  }

  campersInRoom = (): Locator => this.roomItem().locator('ul.list-unstyled li');

  async deleteRoom() {
    await this.roomItem().getByRole('button', { name: 'Excluir' }).click();
    await this.confirmDeleteRoomButton.waitFor({ state: 'visible' });
    await this.confirmDeleteRoomButton.click();
  }
}
