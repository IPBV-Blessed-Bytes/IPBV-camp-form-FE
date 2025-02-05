import { Locator, Page } from '@playwright/test';

export class AuthenticationComponent {
  readonly churchFooterLogo: Locator;
  readonly adminAccess: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly eyeIcon: Locator;
  readonly signInButton: Locator;
  readonly logOutButton: Locator;

  constructor(readonly page: Page) {
    this.churchFooterLogo = page.locator('.form__footer-logo');
    this.adminAccess = page.getByRole('heading', { name: 'ACESSO ADMINISTRAÇÃO' });
    this.usernameInput = page.getByRole('textbox', { name: 'Nome de Usuário:' });
    this.passwordInput = page.getByRole('textbox', { name: 'Senha:' });
    this.eyeIcon = page.locator('svg.login-icon');
    this.signInButton = page.getByRole('button', { name: 'Entrar' });
    this.logOutButton = page.getByRole('button', { name: 'Desconectar' });
  }

  async goToHomePage() {
    await this.page.goto('/', {
      waitUntil: 'commit',
    });
  }

  async goToAdminPage() {
    await this.page.goto('/admin', {
      waitUntil: 'commit',
    });
  }

  async login(user: { email: string; password: string }) {
    await this.fillUsername(user.email);
    await this.fillPassword(user.password);
    await this.signInButton.click();
  }

  async logout() {
    await this.logOutButton.click();
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }
}
