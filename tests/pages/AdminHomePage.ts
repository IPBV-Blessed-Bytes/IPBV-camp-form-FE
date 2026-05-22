import { Locator, Page } from '@playwright/test';

export class AdminHomeComponent {
  readonly registeredButton: Locator;
  readonly registeredHeading: Locator;
  readonly rideButton: Locator;
  readonly rideHeading: Locator;
  readonly discountButton: Locator;
  readonly discountHeading: Locator;
  readonly roomsButton: Locator;
  readonly roomsHeading: Locator;
  readonly teamsButton: Locator;
  readonly teamsHeading: Locator;
  readonly feedbacksButton: Locator;
  readonly feedbacksHeading: Locator;
  readonly extraMealsHeading: Locator;
  readonly checkinButton: Locator;
  readonly checkinHeading: Locator;
  readonly settingsButton: Locator;
  readonly userLogsButton: Locator;
  readonly userLogsHeading: Locator;
  readonly vacanciesManagementButton: Locator;
  readonly vacanciesManagementHeading: Locator;
  readonly usersManagementButton: Locator;
  readonly usersManagementHeading: Locator;
  readonly dataPanelButton: Locator;
  readonly dataPanelHeading: Locator;
  readonly backButton: Locator;
  readonly logoutButton: Locator;
  readonly cardsItems: { button: Locator; heading: Locator }[];
  readonly settingsItems: { button: Locator; heading: Locator }[];

  constructor(readonly page: Page) {
    this.registeredButton = page.getByTestId('session-card-registered-card');
    this.registeredHeading = page.getByRole('heading', { name: 'Gerenciamento de Inscritos' });
    this.rideButton = page.getByTestId('session-card-ride-card');
    this.rideHeading = page.getByRole('heading', { name: 'Gerenciamento de Caronas' });
    this.discountButton = page.getByTestId('session-card-discount-card');
    this.discountHeading = page.getByRole('heading', { name: 'Gerenciamento de Descontos' });
    this.roomsButton = page.getByTestId('session-card-rooms-card');
    this.roomsHeading = page.getByRole('heading', { name: 'Gerenciamento de Quartos' });
    this.teamsButton = page.getByTestId('session-card-teams-card');
    this.teamsHeading = page.getByRole('heading', { name: 'Gerenciamento de Times' });
    this.feedbacksButton = page.getByTestId('session-card-feedback-card');
    this.feedbacksHeading = page.getByRole('heading', { name: 'Gerenciamento de Feedbacks' });
    this.extraMealsHeading = page.getByRole('heading', { name: 'Usuários com Refeições Extras' });
    this.checkinButton = page.getByTestId('session-card-checkin-card');
    this.checkinHeading = page.getByRole('heading', { name: 'Check-in de Usuário' });

    this.settingsButton = page.getByTestId('settings-button');
    this.userLogsButton = page.getByTestId('settings-menu-logs');
    this.userLogsHeading = page.getByRole('heading', { name: 'Logs de Usuários' });
    this.vacanciesManagementButton = page.getByTestId('settings-menu-vacancies');
    this.vacanciesManagementHeading = page.getByRole('heading', { name: 'Gerenciamento de Vagas' });
    this.usersManagementButton = page.getByTestId('settings-menu-users');
    this.usersManagementHeading = page.getByRole('heading', { name: 'Gerenciamento de Acampantes' });
    this.dataPanelButton = page.getByTestId('data-panel-button');
    this.dataPanelHeading = page.getByRole('heading', { name: 'Painel de Dados' });
    this.backButton = page.getByTestId('admin-header-back');
    this.logoutButton = page.getByTestId('admin-logout');

    this.cardsItems = [
      { button: this.registeredButton, heading: this.registeredHeading },
      { button: this.rideButton, heading: this.rideHeading },
      { button: this.discountButton, heading: this.discountHeading },
      { button: this.roomsButton, heading: this.roomsHeading },
      { button: this.teamsButton, heading: this.teamsHeading },
      { button: this.feedbacksButton, heading: this.feedbacksHeading },
      { button: this.checkinButton, heading: this.checkinHeading },
    ];

    this.settingsItems = [
      { button: this.userLogsButton, heading: this.userLogsHeading },
      { button: this.vacanciesManagementButton, heading: this.vacanciesManagementHeading },
      { button: this.usersManagementButton, heading: this.usersManagementHeading },
    ];
  }
}
