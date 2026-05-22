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
    this.adminAccess = page.getByTestId('admin-heading');
    this.usernameInput = page.getByTestId('login-username');
    this.passwordInput = page.getByTestId('login-password');
    this.eyeIcon = page.locator('svg.login-icon');
    this.signInButton = page.getByTestId('login-submit');
    this.logOutButton = page.getByTestId('admin-logout');
  }

  async goToHomePage() {
    await this.page.goto('/', { waitUntil: 'commit' });
    const lgpdCienteButton = this.page.getByRole('dialog').filter({ hasText: 'Conformidade com a LGPD' }).getByRole('button', { name: 'Ciente' });
    try {
      await lgpdCienteButton.waitFor({ state: 'visible', timeout: 5000 });
      await lgpdCienteButton.click();
    } catch {
      // LGPD modal not shown — continue
    }
  }

  async goToAdminPage() {
    await this.page.goto('/admin', { waitUntil: 'commit' });
  }

  async login(user: { email: string; password: string }) {
    await this.goToAdminPage();
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
