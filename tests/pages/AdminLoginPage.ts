import { Locator, Page } from '@playwright/test';

export class AdminLoginComponent {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly eventSelect: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByRole('textbox', { name: 'Nome de Usuário' });
    this.passwordInput = page.getByLabel('Senha', { exact: true });
    this.signInButton = page.getByRole('button', { name: 'Acessar Painel' });
    this.eventSelect = page.getByRole('combobox', { name: 'Selecionar evento' });
  }

  async login(user: { email: string; password: string }) {
    await this.page.goto('/admin', { waitUntil: 'commit' });
    await this.usernameInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.signInButton.click();
    await this.page.waitForFunction(() => !!localStorage.getItem('token_jwt'));
  }

  async selectEvent(name: string) {
    await this.eventSelect.selectOption({ label: name });
  }
}
