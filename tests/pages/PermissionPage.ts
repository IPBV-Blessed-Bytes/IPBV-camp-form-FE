import { Locator, Page } from '@playwright/test';

export class PermissionsComponent {
  readonly logoutButton: Locator;
  readonly allAdminCards: Locator;
  readonly allAdminCardsWithoutCheckin: Locator;
  readonly registeredAndDiscountCards: Locator;
  readonly justCheckinCard: Locator;
  readonly packagesSession: Locator;
  readonly totalSession: Locator;
  readonly managementSession: Locator;
  readonly dataPanelSession: Locator;
  readonly registeredButton: Locator;
  readonly selectAllColumn: Locator;
  readonly editDeleteColumn: Locator;
  readonly newCamperButton: Locator;

  constructor(readonly page: Page) {
    this.logoutButton = page.getByRole('button', { name: 'Desconectar' });
    this.allAdminCards = page.getByText('InscritosCaronasDescontosQuartosFeedbacksAlimentação ExtraCheck-in');
    this.allAdminCardsWithoutCheckin = page.getByText('InscritosCaronasDescontosQuartosFeedbacksAlimentação Extra');
    this.registeredAndDiscountCards = page.getByText('InscritosDescontos');
    this.justCheckinCard = page.getByText('Check-in');
    this.packagesSession = page.getByRole('heading', { name: 'PACOTES:' });
    this.totalSession = page.getByRole('heading', { name: 'TOTAL:' });
    this.managementSession = page.locator('.settings-btn');
    this.dataPanelSession = page.locator('.data-panel-btn');
    this.registeredButton = page
      .locator('div')
      .filter({ hasText: /^Inscritos$/ })
      .nth(2);
    this.selectAllColumn = page.getByRole('cell', { name: 'Selecionar Todos' });
    this.editDeleteColumn = page.getByRole('cell', { name: 'Editar / Deletar' });
    this.newCamperButton = page.getByRole('button', { name: 'Nova Inscrição' });
  }
}
