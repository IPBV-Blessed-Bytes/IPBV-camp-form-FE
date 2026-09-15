import { Locator, Page } from '@playwright/test';

export class PermissionsComponent {
  constructor(readonly page: Page) {}

  card(title: string): Locator {
    return this.page.locator('.session-card').filter({
      has: this.page.locator('.session-card__title', { hasText: title }),
    });
  }

  get totalsSession(): Locator {
    return this.page.getByRole('heading', { name: 'TOTAIS GERAIS' });
  }

  async openCampers() {
    await this.card('Inscrições').first().click();
  }

  get newCamperButton(): Locator {
    return this.page.getByRole('button', { name: 'Nova Inscrição' });
  }
}
