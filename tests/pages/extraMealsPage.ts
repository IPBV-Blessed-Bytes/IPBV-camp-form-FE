import { Locator, Page } from '@playwright/test';

export class ExtraMealsComponent {
  readonly extraMealsHeading: Locator;
  readonly extraMealsTable: Locator;
  readonly tableCamperColumn: Locator;
  readonly tableDaysColumn: Locator;

  constructor(readonly page: Page) {
    this.extraMealsHeading = page.getByRole('heading', { name: 'Usuários com Refeições Extras' });
    this.extraMealsTable = page.locator('.custom-table.table');
    this.tableCamperColumn = page.getByRole('columnheader').filter({ hasText: 'Acampante:' });
    this.tableDaysColumn = page.getByRole('columnheader').filter({ hasText: 'Refeições Extras (Dias):' });
  }

  async goToExtraMealsPage() {
    await this.page.goto('/admin/alimentacao', { waitUntil: 'commit' });
  }
}
