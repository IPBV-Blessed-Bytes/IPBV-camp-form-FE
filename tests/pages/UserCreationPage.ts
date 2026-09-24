import { Locator, Page } from '@playwright/test';

const TEST_USER_EMAIL = 'e2e-usercreation@test.local';

export class UserCreationComponent {
  readonly usersManagementHeading: Locator;
  readonly createNewUserButton: Locator;
  readonly createUserHeading: Locator;
  readonly editUserHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly createUserButton: Locator;
  readonly saveChangesButton: Locator;
  readonly userSuccessfulyCreatedToast: Locator;
  readonly userSuccessfulyEditedToast: Locator;
  readonly userSuccessfulyDeletedToast: Locator;
  readonly emailAlreadyUsedToast: Locator;
  readonly obsEditUser: Locator;
  readonly userCreated: Locator;
  readonly editUserButton: Locator;
  readonly deleteUserButton: Locator;
  readonly modalCloseButton: Locator;
  readonly deleteUserHeading: Locator;
  readonly confirmDeleteUserButton: Locator;

  constructor(readonly page: Page) {
    this.usersManagementHeading = page.getByRole('heading', { level: 1, name: 'Usuários' });
    this.createNewUserButton = page.getByRole('button', { name: 'Criar Novo Usuário' });
    this.createUserHeading = page.locator('.modal-title', { hasText: 'Criar Usuário' });
    this.editUserHeading = page.locator('.modal-title', { hasText: 'Editar Usuário' });
    this.emailInput = page.locator('#formEmail');
    this.passwordInput = page.locator('#formPassword');
    this.roleSelect = page.locator('#formRole');
    this.createUserButton = page.getByRole('button', { name: 'Criar Usuário' });
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.userSuccessfulyCreatedToast = page.getByText('Usuário criado com sucesso');
    this.userSuccessfulyEditedToast = page.getByText('Usuário editado com sucesso');
    this.userSuccessfulyDeletedToast = page.getByText('Usuário deletado com sucesso');
    this.emailAlreadyUsedToast = page.getByText('Este e-mail já está em uso');
    this.obsEditUser = page.getByText('(Irá substituir a senha anterior)');
    this.userCreated = page.getByRole('row').filter({ hasText: TEST_USER_EMAIL });
    this.editUserButton = this.userCreated.getByRole('button', { name: 'Editar usuário' });
    this.deleteUserButton = this.userCreated.getByRole('button', { name: 'Excluir usuário' });
    this.modalCloseButton = page.getByRole('button', { name: 'Cancelar' });
    this.deleteUserHeading = page.locator('.modal-title', { hasText: 'Confirmar Exclusão' });
    this.confirmDeleteUserButton = page.getByRole('button', { name: 'Deletar' });
  }

  async openUsersManagementPage() {
    await this.page.goto('/admin/usuarios', { waitUntil: 'commit' });
  }

  async fillUserData() {
    await this.emailInput.fill(TEST_USER_EMAIL);
    await this.passwordInput.fill('senha@test1');
    await this.roleSelect.selectOption('admin');
    await this.createUserButton.click();
  }

  async editUserData() {
    await this.passwordInput.fill('test@senha1');
    await this.roleSelect.selectOption('collaborator');
    await this.saveChangesButton.click();
  }
}
