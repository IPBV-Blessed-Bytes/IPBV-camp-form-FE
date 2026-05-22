import { Locator, Page } from '@playwright/test';

export class CamperTableComponent {
  readonly registeredCard: Locator;
  readonly heading: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly toggleFiltersButton: Locator;
  readonly downloadReportButton: Locator;
  readonly newCamperButton: Locator;
  readonly deleteSelectedButton: Locator;
  readonly selectAllColumn: Locator;
  readonly editDeleteColumn: Locator;
  readonly nameColumn: Locator;
  readonly checkinColumn: Locator;
  readonly cpfColumn: Locator;

  constructor(readonly page: Page) {
    this.registeredCard = page.getByTestId('session-card-registered-card');
    this.heading = page.getByRole('heading', { name: 'Gerenciamento de Inscritos' });
    this.table = page.locator('table.custom-table');
    this.tableRows = this.table.locator('tbody tr');
    this.toggleFiltersButton = page.getByRole('button', { name: /Filtrar|Ocultar Filtros/ });
    this.downloadReportButton = page.getByRole('button', { name: 'Baixar Relatório' });
    this.newCamperButton = page.getByRole('button', { name: 'Nova Inscrição' });
    this.deleteSelectedButton = page.getByRole('button', { name: 'Deletar', exact: true });
    this.selectAllColumn = page.getByRole('columnheader').filter({ hasText: 'Selecionar Todos' });
    this.editDeleteColumn = page.getByRole('columnheader').filter({ hasText: 'Editar / Deletar' });
    this.nameColumn = page.getByRole('columnheader').filter({ hasText: 'Nome:' });
    this.checkinColumn = page.getByRole('columnheader').filter({ hasText: 'Check-in:' });
    this.cpfColumn = page.getByRole('columnheader').filter({ hasText: 'CPF:' });
  }

  async navigateToCampersTable() {
    await this.page.goto('/admin/acampantes', { waitUntil: 'commit' });
  }

  rowAt(index: number): Locator {
    return this.page.getByTestId(`campers-row-${index}`);
  }

  cellAt(rowIndex: number, columnId: string): Locator {
    return this.rowAt(rowIndex).getByTestId(`campers-cell-${columnId}`);
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async openNewCamperModal() {
    await this.newCamperButton.click();
  }

  async toggleFilters() {
    await this.toggleFiltersButton.click();
  }
}
