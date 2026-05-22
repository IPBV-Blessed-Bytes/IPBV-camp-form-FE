import { Locator, Page } from '@playwright/test';

export class AvoidBypassComponent {
  readonly adminAccess: Locator;
  readonly logOutButon: Locator;
  readonly dontHavePermission: Locator;
  readonly campersPageHeading: Locator;
  readonly checkinPageHeading: Locator;

  constructor(readonly page: Page) {
    this.adminAccess = page.getByTestId('admin-heading');
    this.logOutButon = page.getByTestId('admin-logout');
    this.dontHavePermission = page.getByText('Você não tem permissão');
    this.campersPageHeading = page.getByRole('heading', { name: 'Gerenciamento de Inscritos' });
    this.checkinPageHeading = page.getByRole('heading', { name: 'Check-in de Usuário' });
  }

  async goToAllowedPage() {
    await this.page.goto('/admin/checkin', { waitUntil: 'commit' });
  }

  async goToPageNotAllowed() {
    await this.page.goto('/admin/acampantes', { waitUntil: 'commit' });
  }
}
