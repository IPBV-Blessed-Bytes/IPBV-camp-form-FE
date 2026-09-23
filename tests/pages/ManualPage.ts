import { Locator, Page } from '@playwright/test';

export class ManualComponent {
  readonly title: Locator;
  readonly clientTab: Locator;
  readonly ownerTab: Locator;
  readonly architectureTab: Locator;
  readonly salesTab: Locator;
  readonly subnavTitle: Locator;
  readonly subnavLinks: Locator;
  readonly clientDefaultHeading: Locator;
  readonly architectureStackHeading: Locator;
  readonly salesPricesHeading: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByRole('heading', { name: 'Manual da Plataforma' });
    this.clientTab = page.getByRole('tab', { name: 'Ajuda do cliente' });
    this.ownerTab = page.getByRole('tab', { name: 'Runbook do dono' });
    this.architectureTab = page.getByRole('tab', { name: 'Arquitetura' });
    this.salesTab = page.getByRole('tab', { name: 'Vendas' });
    this.subnavTitle = page.getByText('Nesta seção');
    this.subnavLinks = page.locator('.manual__subnav a');
    this.clientDefaultHeading = page.getByRole('heading', { name: 'Primeiros passos' });
    this.architectureStackHeading = page.getByRole('heading', { name: 'Stack', exact: true });
    this.salesPricesHeading = page.getByRole('heading', { name: 'Preços', exact: true });
  }

  async goto() {
    await this.page.goto('/admin/manual', { waitUntil: 'commit' });
  }
}
