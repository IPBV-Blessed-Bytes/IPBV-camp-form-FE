import { Locator, Page } from '@playwright/test';

export class PermissionsComponent {
  readonly logoutButton: Locator;
  readonly registeredCard: Locator;
  readonly rideCard: Locator;
  readonly discountCard: Locator;
  readonly roomsCard: Locator;
  readonly teamsCard: Locator;
  readonly feedbackCard: Locator;
  readonly checkinCard: Locator;
  readonly validPackagesSection: Locator;
  readonly totalSection: Locator;
  readonly managementSection: Locator;
  readonly dataPanelSection: Locator;
  readonly selectAllColumn: Locator;
  readonly editDeleteColumn: Locator;
  readonly newCamperButton: Locator;

  constructor(readonly page: Page) {
    this.logoutButton = page.getByTestId('admin-logout');
    this.registeredCard = page.getByTestId('session-card-registered-card');
    this.rideCard = page.getByTestId('session-card-ride-card');
    this.discountCard = page.getByTestId('session-card-discount-card');
    this.roomsCard = page.getByTestId('session-card-rooms-card');
    this.teamsCard = page.getByTestId('session-card-teams-card');
    this.feedbackCard = page.getByTestId('session-card-feedback-card');
    this.checkinCard = page.getByTestId('session-card-checkin-card');
    this.validPackagesSection = page.getByRole('heading', { name: 'PACOTES (válidos):' });
    this.totalSection = page.getByRole('heading', { name: 'TOTAL:' });
    this.managementSection = page.getByTestId('settings-button');
    this.dataPanelSection = page.getByTestId('data-panel-button');
    this.selectAllColumn = page.getByRole('columnheader').filter({ hasText: 'Selecionar Todos' });
    this.editDeleteColumn = page.getByRole('columnheader').filter({ hasText: 'Editar / Deletar' });
    this.newCamperButton = page.getByRole('button', { name: 'Nova Inscrição' });
  }
}
