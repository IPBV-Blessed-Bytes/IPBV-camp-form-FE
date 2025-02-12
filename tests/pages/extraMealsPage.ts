import { Locator, Page } from '@playwright/test';

export class ExtraMealsComponent {
  readonly extraMealsButton: Locator;
  readonly extraMealsHeading: Locator;
  readonly extraMealsTable: Locator;
  readonly tableCamperColumn: Locator;
  readonly tableDaysColumn: Locator;

  constructor(readonly page: Page) {
    this.extraMealsButton = page.getByText('Alimentação Extra');
    this.extraMealsHeading = page.getByRole('heading', { name: 'Usuários com Refeições Extras' });
    this.extraMealsTable = page.locator('.custom-table.table');
    this.tableCamperColumn = page.locator('thead tr').filter({
      has: page.locator('th').nth(0).filter({ hasText: 'Acampante:' }),
    });
    this.tableDaysColumn = page.locator('thead tr').filter({
      has: page.locator('th').nth(1).filter({ hasText: 'Refeições Extras (Dias):' }),
    });
  }
}
