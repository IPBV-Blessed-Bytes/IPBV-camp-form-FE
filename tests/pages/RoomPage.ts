import { Locator, Page } from '@playwright/test';

const TEST_ROOM_NAME = 'Quarto de Teste Playwright';

export class RoomComponent {
  readonly roomName: string;
  readonly roomsButton: Locator;
  readonly roomsHeading: Locator;
  readonly addNewRoomButton: Locator;
  readonly roomNameInput: Locator;
  readonly createRoomButton: Locator;
  readonly roomAccordion: Locator;
  readonly roomAccordionHeader: Locator;
  readonly selectCamperToAddRoom: Locator;
  readonly confirmAddRoomButton: Locator;
  readonly campersInsideRoom: Locator;
  readonly deleteRoomButton: Locator;
  readonly confirmDeleteRoomModal: Locator;
  readonly confirmDeleteRoomButton: Locator;
  readonly roomCreatedToast: Locator;
  readonly roomDeletedToast: Locator;

  constructor(readonly page: Page) {
    this.roomName = TEST_ROOM_NAME;
    this.roomsButton = page.getByTestId('session-card-rooms-card');
    this.roomsHeading = page.getByRole('heading', { name: 'Gerenciamento de Quartos' });
    this.addNewRoomButton = page.getByTestId('add-new-room');
    this.roomNameInput = page.getByPlaceholder('Nome do novo quarto');
    this.createRoomButton = page.getByRole('button', { name: 'Criar Quarto' });
    this.roomAccordion = page.getByTestId(`room-item-${TEST_ROOM_NAME}`);
    this.roomAccordionHeader = this.roomAccordion.getByRole('button', { name: TEST_ROOM_NAME });
    this.selectCamperToAddRoom = page.getByTestId(`room-camper-select-${TEST_ROOM_NAME}`);
    this.confirmAddRoomButton = page.getByTestId(`room-add-camper-${TEST_ROOM_NAME}`);
    this.campersInsideRoom = page.getByTestId(`room-campers-list-${TEST_ROOM_NAME}`).locator('li');
    this.deleteRoomButton = page.getByTestId(`room-delete-${TEST_ROOM_NAME}`);
    this.confirmDeleteRoomModal = page.getByRole('dialog').filter({ hasText: 'Confirmar Exclusão' });
    this.confirmDeleteRoomButton = this.confirmDeleteRoomModal.getByRole('button', { name: 'Excluir', exact: true });
    this.roomCreatedToast = page.getByText('Quarto criado com sucesso');
    this.roomDeletedToast = page.getByText('Quarto excluido com sucesso');
  }

  async createNewRoom() {
    await this.addNewRoomButton.click();
    await this.roomNameInput.fill(this.roomName);
    await this.createRoomButton.click();
  }

  async fillRoom(camperId: string) {
    await this.roomAccordionHeader.click();
    await this.selectCamperToAddRoom.selectOption(camperId);
    await this.confirmAddRoomButton.click();
  }
}
