import { Locator, Page } from '@playwright/test';

export class RideComponent {
  readonly rideCard: Locator;
  readonly heading: Locator;
  readonly downloadReportButton: Locator;
  readonly offerRideAccordion: Locator;
  readonly needRideAccordion: Locator;
  readonly tables: Locator;
  readonly offerRideTable: Locator;
  readonly needRideTable: Locator;
  readonly deleteRelationshipModal: Locator;
  readonly confirmDeleteRelationshipButton: Locator;

  constructor(readonly page: Page) {
    this.rideCard = page.getByTestId('session-card-ride-card');
    this.heading = page.getByRole('heading', { name: 'Gerenciamento de Caronas' });
    this.downloadReportButton = page.getByRole('button', { name: 'Baixar Relatório' });
    this.offerRideAccordion = page.getByRole('button', { name: 'Oferecem Carona' });
    this.needRideAccordion = page.getByRole('button', { name: 'Precisam de Carona' });
    this.tables = page.locator('table.custom-table');
    this.offerRideTable = this.tables.nth(0);
    this.needRideTable = this.tables.nth(1);
    this.deleteRelationshipModal = page.getByRole('dialog').filter({ hasText: 'Confirmar Exclusão' });
    this.confirmDeleteRelationshipButton = this.deleteRelationshipModal.getByRole('button', { name: 'Excluir' });
  }

  async navigateToRidePage() {
    await this.page.goto('/admin/carona', { waitUntil: 'commit' });
  }

  async expandOfferRide() {
    await this.offerRideAccordion.click();
  }

  async expandNeedRide() {
    await this.needRideAccordion.click();
  }

  rideOfferRow(name: string): Locator {
    return this.offerRideTable.locator('tbody tr').filter({ hasText: name }).first();
  }

  rideNeedRow(name: string): Locator {
    return this.needRideTable.locator('tbody tr').filter({ hasText: name }).first();
  }
}
