import { Locator, Page } from '@playwright/test';

export class UserCreationComponent {
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
  readonly editPasswordInput: Locator;
  readonly userSuccessfulyEditedToast: Locator;
  readonly userUpdated: Locator;
  readonly saveChangesButton: Locator;
  readonly deleteUserHeading: Locator;
  readonly deleteUserButton: Locator;
  readonly deleteUserDuplicatedButton: Locator;
  readonly confirmDeleteUserButton: Locator;
  readonly userSuccessfulyDeletedToast: Locator;

  constructor(readonly page: Page) {
    this.settingsButton = this.page.getByRole('button').filter({ hasText: /^$/ }).nth(2);
    this.usersManagementButton = page.getByRole('button', { name: 'Controle de Usuários' });
    this.usersManagementHeading = page.getByRole('heading', { name: 'Gerenciamento de Usuários' });
    this.createNewUserButton = page.getByRole('button', { name: 'Criar Novo Usuário' });
    this.createUserHeading = page
      .locator('div')
      .filter({ hasText: /^Criar Usuário$/ })
      .first();
    this.userInput = page.getByRole('textbox', { name: 'Usuário:' });
    this.passwordInput = page.getByRole('textbox', { name: 'Senha:' });
    this.roleSelect = page.getByLabel('Função:');
    this.createUserButton = page.getByRole('button', { name: 'Criar Usuário' });
    this.userSuccessfulyCreatedToast = page.getByText('Usuário criado com sucesso');
    this.userCreated = page
      .locator('tbody tr')
      .filter({
        has: page.locator('td').filter({ hasText: 'usuario@test' }),
      })
      .filter({
        has: page.locator('td').filter({ hasText: 'Admin' }),
      });
    this.usernameAlreadyUsedToast = page.getByText('Este nome de usuário já está em uso');
    this.modalCloseButton = page.getByRole('button', { name: 'Cancelar' });
    this.editUserButton = page.getByRole('row', { name: 'usuario@test Admin' }).getByRole('button').first();
    this.editUserHeading = page.locator('div').filter({ hasText: 'Editar Usuário' }).nth(3);
    this.obsEditUser = page.getByText('* (Irá substituir a senha');
    this.editPasswordInput = page.getByRole('textbox', { name: 'Nova Senha: * (Irá substituir' });
    this.userSuccessfulyEditedToast = page.getByText('Usuário editado com sucesso');
    this.userUpdated = page
      .locator('tbody tr')
      .filter({
        has: page.locator('td').filter({ hasText: 'test@usuario' }),
      })
      .filter({
        has: page.locator('td').filter({ hasText: 'Colaborador' }),
      });
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.deleteUserButton = page.getByRole('row', { name: 'test@usuario Colaborador' }).getByRole('button').nth(1);
    this.deleteUserDuplicatedButton = page.getByRole('row', { name: 'usuario@test Admin' }).getByRole('button').nth(1);
    this.deleteUserHeading = page.locator('div').filter({ hasText: 'Confirmar Exclusão' }).nth(3);
    this.confirmDeleteUserButton = page.getByRole('button', { name: 'Deletar' });
    this.userSuccessfulyDeletedToast = page.getByText('Usuário deletado com sucesso');
  }

  async openUsersManagementPage() {
    await this.settingsButton.click();
    await this.usersManagementButton.click();
  }

  async fillUserData() {
    await this.userInput.fill('usuario@test');
    await this.passwordInput.fill('senha@test');
    await this.roleSelect.selectOption('admin');
    await this.createUserButton.click();
  }

  async editUserData() {
    await this.userInput.fill('test@usuario');
    await this.editPasswordInput.fill('test@senha');
    await this.roleSelect.selectOption('collaborator');
    await this.saveChangesButton.click();
  }
}
