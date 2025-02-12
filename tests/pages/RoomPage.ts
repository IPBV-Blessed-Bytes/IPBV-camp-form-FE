import { Locator, Page } from '@playwright/test';

export class RoomComponent {
  readonly roomsButton: Locator;
  readonly roomsHeading: Locator;
  readonly addNewRoomButton: Locator;
  readonly roomNameInput: Locator;
  readonly createRoomButton: Locator;
  readonly roomAccordion: Locator;
  readonly selectCamperToAddRoom: Locator;
  readonly confirmAddRoomButton: Locator;
  readonly campersInsideRoom: Locator;
  readonly deleteRoomButton: Locator;
  readonly confirmDeleteRoomModal: Locator;
  readonly confirmDeleteRoomButton: Locator;

  constructor(readonly page: Page) {
    this.roomsButton = page.getByText('Quartos');
    this.roomsHeading = page.getByRole('heading', { name: 'Gerenciamento de Quartos' });
    this.addNewRoomButton = page.getByRole('button', { name: 'Adicionar Novo Quarto' });
    this.roomNameInput = page.getByRole('textbox', { name: 'Nome do Quarto:' });
    this.createRoomButton = page.getByRole('button', { name: 'Criar Quarto' });
    this.roomAccordion = page.getByRole('button', { name: 'nome do quarto' });
    this.selectCamperToAddRoom = page.getByRole('combobox');
    this.confirmAddRoomButton = page.getByRole('button', { name: 'Adicionar ao Quarto' });
    this.campersInsideRoom = page
      .locator('.accordion-item')
      .filter({
        has: page.getByRole('button', { name: 'nome do quarto' }),
      })
      .locator('ol li');
    this.deleteRoomButton = page.getByRole('button', { name: 'Excluir Quarto' });
    this.confirmDeleteRoomModal = page.locator('div').filter({ hasText: 'Confirmar Exclusão' }).nth(3);
    this.confirmDeleteRoomButton = page.getByRole('button', { name: 'Excluir', exact: true });
  }

  async createNewRoom() {
    await this.addNewRoomButton.click();
    await this.roomNameInput.fill('nome do quarto');
    await this.createRoomButton.click();
  }

  async fillRoom() {
    await this.roomAccordion.click();
    await this.selectCamperToAddRoom.selectOption('492');
    await this.confirmAddRoomButton.click();
    await this.selectCamperToAddRoom.selectOption('416');
    await this.confirmAddRoomButton.click();
  }
}
