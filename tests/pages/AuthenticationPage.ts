import { Locator, Page } from '@playwright/test';

export class AuthenticationComponent {
  readonly adminAccess: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly eyeIcon: Locator;
  readonly signInButton: Locator;
  private loggedUser = '';

  constructor(readonly page: Page) {
    // "Acessar Painel" só existe quando NÃO logado — serve de indicador de logout.
    this.adminAccess = page.getByRole('button', { name: 'Acessar Painel' });
    this.usernameInput = page.locator('#login');
    this.passwordInput = page.locator('#password');
    this.eyeIcon = page.locator('button.password-toggle-btn');
    this.signInButton = page.getByRole('button', { name: 'Acessar Painel' });
  }

  async goToHomePage() {
    await this.page.goto('/', { waitUntil: 'commit' });
  }

  async goToAdminPage() {
    await this.page.goto('/admin', { waitUntil: 'commit' });
  }

  async login(user: { email: string; password: string }) {
    await this.goToAdminPage();
    await this.fillUsername(user.email);
    await this.fillPassword(user.password);
    this.loggedUser = user.email.split('@')[0];
    await this.signInButton.click();
  }

  async logout() {
    // O logout vive num dropdown no topbar (botão com o nome do usuário).
    await this.page.locator(`button:has-text("${this.loggedUser}")`).first().click();
    await this.page.getByRole('button', { name: 'Desconectar' }).click();
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }
}
