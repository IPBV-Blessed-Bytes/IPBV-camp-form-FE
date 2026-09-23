import { Locator, Page } from '@playwright/test';

export class StorefrontComponent {
  readonly heroTitle: Locator;
  readonly plansSectionTitle: Locator;
  readonly paidPlanName: Locator;
  readonly paidPlanPrice: Locator;
  readonly freePlanName: Locator;
  readonly freePlanPrice: Locator;
  readonly noMonthlyPlanName: Locator;
  readonly noMonthlyPlanPrice: Locator;
  readonly churchNameInput: Locator;
  readonly slugInput: Locator;
  readonly adminNameInput: Locator;
  readonly adminEmailInput: Locator;
  readonly adminPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly churchNameError: Locator;

  constructor(readonly page: Page) {
    this.heroTitle = page.getByRole('heading', { name: 'Crie o sistema de inscrições da sua igreja em minutos' });
    this.plansSectionTitle = page.getByRole('heading', { name: 'Preços simples, sem mensalidade' });
    this.paidPlanName = page.getByText('Evento pago', { exact: true });
    this.paidPlanPrice = page.locator('.storefront__plan--feature .storefront__plan-price');
    this.freePlanName = page.getByText('Evento gratuito', { exact: true });
    this.freePlanPrice = page
      .locator('.storefront__plan')
      .filter({ hasText: 'Evento gratuito' })
      .locator('.storefront__plan-price');
    this.noMonthlyPlanName = page.getByText('Sem mensalidade', { exact: true });
    this.noMonthlyPlanPrice = page
      .locator('.storefront__plan')
      .filter({ hasText: 'Sem mensalidade' })
      .locator('.storefront__plan-price');
    this.churchNameInput = page.getByPlaceholder('Ex.: Igreja Batista Central');
    this.slugInput = page.getByPlaceholder('igreja-batista-central');
    this.adminNameInput = page.getByPlaceholder('Nome do administrador');
    this.adminEmailInput = page.getByPlaceholder('voce@igreja.com');
    this.adminPasswordInput = page.getByPlaceholder('Mínimo 6 caracteres');
    this.submitButton = page.getByRole('button', { name: 'Criar meu sistema' });
    this.churchNameError = page.getByText('Informe o nome da igreja ou organização.');
  }

  async goto() {
    await this.page.goto('/comprar', { waitUntil: 'commit' });
  }
}
