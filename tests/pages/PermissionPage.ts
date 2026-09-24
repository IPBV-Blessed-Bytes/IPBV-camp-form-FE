import { Locator, Page } from '@playwright/test';

export class PermissionsComponent {
  readonly logoutButton: Locator;
  readonly inscricoesCard: Locator;
  readonly caronasCard: Locator;
  readonly descontosCard: Locator;
  readonly quartosCard: Locator;
  readonly timesCard: Locator;
  readonly feedbacksCard: Locator;
  readonly checkinCard: Locator;
  readonly configuracoesCard: Locator;
  readonly packagesSession: Locator;
  readonly totalSession: Locator;

  constructor(readonly page: Page) {
    this.logoutButton = page.locator('.admin-topbar__user');
    this.inscricoesCard = page.getByRole('heading', { name: 'Inscrições', exact: true });
    this.caronasCard = page.getByRole('heading', { name: 'Caronas', exact: true });
    this.descontosCard = page.getByRole('heading', { name: 'Descontos', exact: true });
    this.quartosCard = page.getByRole('heading', { name: 'Quartos', exact: true });
    this.timesCard = page.getByRole('heading', { name: 'Times', exact: true });
    this.feedbacksCard = page.getByRole('heading', { name: 'Feedbacks', exact: true });
    this.checkinCard = page.getByRole('heading', { name: 'Check-in', exact: true });
    this.configuracoesCard = page.getByRole('heading', { name: 'Configurações', exact: true });
    this.packagesSession = page.getByRole('heading', { name: 'Pacotes válidos', exact: true });
    this.totalSession = page.getByRole('heading', { name: 'Totais gerais', exact: true });
  }
}
