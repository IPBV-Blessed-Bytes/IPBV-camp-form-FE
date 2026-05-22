import { Locator, Page } from '@playwright/test';

const TEST_USERNAME = 'usuario@test';
const EDITED_USERNAME = 'test@usuario';

export class UserCreationComponent {
  readonly testUsername: string;
  readonly editedUsername: string;
  readonly settingsButton: Locator;
  readonly usersManagementButton: Locator;
  readonly usersManagementHeading: Locator;
  readonly createNewUserButton: Locator;
  readonly createUserHeading: Locator;
  readonly userInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly createUserButton: Locator;
  readonly userSuccessfulyCreatedToast: Locator;
  readonly userCreated: Locator;
  readonly usernameAlreadyUsedToast: Locator;
  readonly modalCloseButton: Locator;
  readonly editUserButton: Locator;
  readonly editUserHeading: Locator;
  readonly obsEditUser: Locator;
  readonly userSuccessfulyEditedToast: Locator;
  readonly userUpdated: Locator;
  readonly saveChangesButton: Locator;
  readonly deleteUserHeading: Locator;
  readonly deleteUserButton: Locator;
  readonly deleteUserDuplicatedButton: Locator;
  readonly confirmDeleteUserButton: Locator;
  readonly userSuccessfulyDeletedToast: Locator;

  constructor(readonly page: Page) {
    this.testUsername = TEST_USERNAME;
    this.editedUsername = EDITED_USERNAME;
    this.settingsButton = page.getByTestId('settings-button');
    this.usersManagementButton = page.getByTestId('settings-menu-users');
    this.usersManagementHeading = page.getByRole('heading', { name: 'Gerenciamento de Acampantes' });
    this.createNewUserButton = page.getByRole('button', { name: 'Criar Novo Usuário' });
    this.createUserHeading = page.getByRole('dialog').filter({ hasText: 'Criar Usuário' }).first();
    this.userInput = page.getByPlaceholder('Digite o nome de usuário');
    this.passwordInput = page.getByPlaceholder('Digite a senha');
    this.roleSelect = page.getByLabel('Função:');
    this.createUserButton = page.getByRole('button', { name: 'Criar Usuário', exact: true });
    this.userSuccessfulyCreatedToast = page.getByText('Usuário criado com sucesso');
    this.userCreated = page.getByTestId(`user-row-${TEST_USERNAME}`);
    this.usernameAlreadyUsedToast = page.getByText('Este nome de usuário já está em uso');
    this.modalCloseButton = page.getByRole('button', { name: 'Cancelar' }).first();
    this.editUserButton = page.getByTestId(`user-edit-${TEST_USERNAME}`);
    this.editUserHeading = page.getByRole('dialog').filter({ hasText: 'Editar Usuário' });
    this.obsEditUser = page.getByText('Irá substituir a senha');
    this.userSuccessfulyEditedToast = page.getByText('Usuário editado com sucesso');
    this.userUpdated = page.getByTestId(`user-row-${EDITED_USERNAME}`);
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.deleteUserButton = page.getByTestId(`user-delete-${EDITED_USERNAME}`);
    this.deleteUserDuplicatedButton = page.getByTestId(`user-delete-${TEST_USERNAME}`);
    this.deleteUserHeading = page.getByRole('dialog').filter({ hasText: 'Confirmar Exclusão' });
    this.confirmDeleteUserButton = page.getByRole('button', { name: 'Deletar' });
    this.userSuccessfulyDeletedToast = page.getByText('Usuário deletado com sucesso');
  }

  async openUsersManagementPage() {
    await this.settingsButton.click();
    await this.usersManagementButton.click();
  }

  async fillUserData() {
    await this.userInput.fill(TEST_USERNAME);
    await this.passwordInput.fill('senha@test');
    await this.roleSelect.selectOption('admin');
    await this.createUserButton.click();
  }

  async editUserData() {
    await this.userInput.fill(EDITED_USERNAME);
    await this.passwordInput.fill('test@senha');
    await this.roleSelect.selectOption('collaborator');
    await this.saveChangesButton.click();
  }
}
