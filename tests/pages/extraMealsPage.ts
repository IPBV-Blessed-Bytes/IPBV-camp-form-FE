import { Locator, Page } from '@playwright/test';

export class ExtraMealsComponent {
  readonly heading: Locator;
  readonly camperColumn: Locator;
  readonly daysColumn: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Usuários com Refeições Extras' });
    this.camperColumn = page.getByRole('columnheader', { name: 'Acampante:' });
    this.daysColumn = page.getByRole('columnheader', { name: 'Refeições Extras (Dias):' });
  }

  async open() {
    await this.page.goto('/admin/alimentacao', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }
}
