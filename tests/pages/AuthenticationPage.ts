import { Locator, Page } from '@playwright/test';

export class AuthenticationComponent {
  readonly churchFooterLogo: Locator;
  readonly adminAccess: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly eyeIcon: Locator;
  readonly signInButton: Locator;
  readonly logOutButton: Locator;
  readonly userMenuButton: Locator;
  readonly eventSelect: Locator;

  constructor(readonly page: Page) {
    this.churchFooterLogo = page.locator('.form__footer-logo');
    this.adminAccess = page.getByRole('heading', { name: 'Painel Administrativo' });
    this.usernameInput = page.getByRole('textbox', { name: 'Nome de Usuário' });
    this.passwordInput = page.getByLabel('Senha', { exact: true });
    this.eyeIcon = page.locator('.password-toggle-btn');
    this.signInButton = page.getByRole('button', { name: 'Acessar Painel' });
    this.logOutButton = page.getByRole('button', { name: 'Desconectar' });
    this.userMenuButton = page.locator('.admin-topbar__user');
    this.eventSelect = page.getByRole('combobox', { name: 'Selecionar evento' });
  }

  async goToHomePage() {
    await this.page.goto('/', {
      waitUntil: 'commit',
    });
  }

  async goToEventForm(slug: string) {
    await this.page.goto(`/e/${slug}`, {
      waitUntil: 'commit',
    });
  }

  async goToAdminPage() {
    await this.page.goto('/admin', {
      waitUntil: 'commit',
    });
  }

  async login(user: { email: string; password: string }) {
    await this.goToAdminPage();
    await this.fillUsername(user.email);
    await this.fillPassword(user.password);
    await this.signInButton.click();
    await this.page.waitForFunction(() => !!localStorage.getItem('token_jwt'));
  }

  async selectEvent(slug: string) {
    await this.page.evaluate((value) => localStorage.setItem('selected-event', value), slug);
    await this.page.goto('/admin', { waitUntil: 'commit' });
    await this.page.waitForLoadState('load');
  }

  async logout() {
    await this.userMenuButton.click();
    await this.logOutButton.click();
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }
}
