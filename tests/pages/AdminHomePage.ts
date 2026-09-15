import { Locator, Page } from '@playwright/test';

export class AdminHomeComponent {
  readonly backButton: Locator;

  constructor(readonly page: Page) {
    this.backButton = page.getByRole('button', { name: 'Voltar' });
  }

  card(title: string): Locator {
    return this.page.locator('.session-card').filter({ hasText: title });
  }

  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name }).first();
  }

  async openSection(title: string) {
    const card = this.card(title).first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
  }

  async goBack() {
    await this.backButton.first().click();
  }
}
