import { Locator, Page } from '@playwright/test';

export class PlatformComponent {
  readonly title: Locator;
  readonly statCards: Locator;
  readonly organizationsStat: Locator;
  readonly eventsStat: Locator;
  readonly registrationsStat: Locator;
  readonly usersStat: Locator;
  readonly pricingHeading: Locator;
  readonly feePercentLabel: Locator;
  readonly freeEventFeeLabel: Locator;
  readonly freeEventAnnualLabel: Locator;
  readonly savePricingButton: Locator;
  readonly organizationsTable: Locator;
  readonly ipbvOrgCell: Locator;
  readonly storeFaqsHeading: Locator;
  readonly newOrganizationButton: Locator;
  readonly modal: Locator;
  readonly modalNameLabel: Locator;
  readonly modalSlugLabel: Locator;
  readonly modalCancelButton: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByRole('heading', { name: 'Painel da Plataforma' });
    this.statCards = page.locator('.stat-cards');
    this.organizationsStat = this.statCards.getByText('Organizações', { exact: true });
    this.eventsStat = this.statCards.getByText('Eventos', { exact: true });
    this.registrationsStat = this.statCards.getByText('Inscrições', { exact: true });
    this.usersStat = this.statCards.getByText('Usuários', { exact: true });
    this.pricingHeading = page.getByRole('heading', { name: 'Preços da plataforma' });
    this.feePercentLabel = page.getByText('Taxa por inscrição paga (%):');
    this.freeEventFeeLabel = page.getByText('Evento gratuito — por evento (R$):');
    this.freeEventAnnualLabel = page.getByText('Evento gratuito — anual ilimitado (R$):');
    this.savePricingButton = page.getByRole('button', { name: 'Salvar preços' });
    this.organizationsTable = page.locator('.platform__table');
    this.ipbvOrgCell = this.organizationsTable.getByText('IPBV', { exact: true });
    this.storeFaqsHeading = page.getByRole('heading', { name: 'Perguntas frequentes da loja' });
    this.newOrganizationButton = page.getByRole('button', { name: 'Nova organização' });
    this.modal = page.getByRole('dialog');
    this.modalNameLabel = this.modal.getByText('Nome:', { exact: true });
    this.modalSlugLabel = this.modal.getByText('Identificador (slug):', { exact: true });
    this.modalCancelButton = this.modal.getByRole('button', { name: 'Cancelar' });
  }

  async goto() {
    await this.page.goto('/platform', { waitUntil: 'commit' });
  }

  async openNewOrganizationModal() {
    await this.newOrganizationButton.click();
  }

  async closeModal() {
    await this.modalCancelButton.click();
  }
}
