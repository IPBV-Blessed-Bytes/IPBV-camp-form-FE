import { Locator, Page } from '@playwright/test';

export class UserCreationComponent {
  readonly heading: Locator;
  readonly createNewUserButton: Locator;
  readonly displayNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly submitCreateButton: Locator;
  readonly saveChangesButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly createdToast: Locator;
  readonly editedToast: Locator;
  readonly deletedToast: Locator;
  readonly emailInUseToast: Locator;

  constructor(readonly page: Page) {
    this.heading = page.locator('.admin-subpage__title', { hasText: 'Usuários' });
    this.createNewUserButton = page.getByRole('button', { name: 'Criar Novo Usuário' });
    this.displayNameInput = page.locator('#formDisplayName');
    this.emailInput = page.locator('#formEmail');
    this.passwordInput = page.locator('#formPassword');
    this.roleSelect = page.locator('#formRole');
    this.submitCreateButton = page.getByRole('button', { name: 'Criar Usuário' });
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Deletar' });
    this.createdToast = page.getByText('Usuário criado com sucesso');
    this.editedToast = page.getByText('Usuário editado com sucesso');
    this.deletedToast = page.getByText('Usuário deletado com sucesso');
    this.emailInUseToast = page.getByText('Este e-mail já está cadastrado');
  }

  // Linha identificada pelo e-mail (identidade única do usuário).
  userRow = (email: string): Locator =>
    this.page.locator('tbody tr').filter({ has: this.page.locator('td', { hasText: email }) });

  async open() {
    await this.page.goto('/admin/usuarios', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async createUser(email: string, role = 'admin') {
    await this.createNewUserButton.click();
    await this.emailInput.waitFor({ state: 'visible' });
    await this.displayNameInput.fill('Usuario Teste');
    await this.emailInput.fill(email);
    await this.passwordInput.fill('senha@test');
    await this.roleSelect.selectOption(role);
    await this.submitCreateButton.click();
    // Em caso de sucesso o modal fecha; se o e-mail já existe, permanece aberto.
    await Promise.race([
      this.emailInput.waitFor({ state: 'hidden', timeout: 15000 }),
      this.emailInUseToast.waitFor({ state: 'visible', timeout: 15000 }),
    ]).catch(() => {});
  }

  async editUserRole(email: string, role: string) {
    await this.userRow(email).getByRole('button').first().click();
    await this.roleSelect.waitFor({ state: 'visible' });
    await this.roleSelect.selectOption(role);
    await this.saveChangesButton.click();
  }

  async deleteUser(email: string) {
    await this.userRow(email).getByRole('button').nth(1).click();
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
  }
}
