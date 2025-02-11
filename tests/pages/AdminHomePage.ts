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
  readonly feedbacksButton: Locator;
  readonly feedbacksHeading: Locator;
  readonly extraMealsButton: Locator;
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
    this.registeredButton = page.getByText('Inscritos', { exact: true });
    this.registeredHeading = page.getByRole('heading', { name: 'Gerenciamento de Inscritos' });
    this.rideButton = page.getByText('Caronas');
    this.rideHeading = page.getByRole('heading', { name: 'Gerenciamento de Caronas' });
    this.discountButton = page.getByText('Descontos');
    this.discountHeading = page.getByRole('heading', { name: 'Gerenciamento de Descontos' });
    this.roomsButton = page.getByText('Quartos');
    this.roomsHeading = page.getByRole('heading', { name: 'Gerenciamento de Quartos' });
    this.feedbacksButton = page.getByText('Feedbacks');
    this.feedbacksHeading = page.getByRole('heading', { name: 'Gerenciamento de Feedbacks' });
    this.extraMealsButton = page.getByText('Alimentação Extra');
    this.extraMealsHeading = page.getByRole('heading', { name: 'Usuários com Refeições Extras' });
    this.checkinButton = page.getByText('Check-in');
    this.checkinHeading = page.getByRole('heading', { name: 'Check-in de Usuário' });
    this.userLogsButton = page.getByRole('button', { name: 'Logs de Usuários' });
    this.userLogsHeading = page.getByRole('heading', { name: 'Logs de Usuários' });
    this.vacanciesManagementButton = page.getByRole('button', { name: 'Controle de Vagas' });
    this.vacanciesManagementHeading = page.getByRole('heading', { name: 'Gerenciamento de Vagas' });
    this.usersManagementButton = page.getByRole('button', { name: 'Controle de Usuários' });
    this.usersManagementHeading = page.getByRole('heading', { name: 'Gerenciamento de Usuários' });
    this.dataPanelButton = page.getByRole('button').filter({ hasText: /^$/ }).first();
    this.dataPanelHeading = page.getByRole('heading', { name: 'Painel de Dados' });
    this.settingsButton = page.getByRole('button').filter({ hasText: /^$/ }).nth(1);
    this.backButton = page.getByRole('button', { name: 'Voltar' });
    this.logoutButton = page.getByRole('button', { name: 'Desconectar' });

    this.cardsItems = [
      { button: this.registeredButton, heading: this.registeredHeading },
      { button: this.rideButton, heading: this.rideHeading },
      { button: this.discountButton, heading: this.discountHeading },
      { button: this.roomsButton, heading: this.roomsHeading },
      { button: this.feedbacksButton, heading: this.feedbacksHeading },
      { button: this.extraMealsButton, heading: this.extraMealsHeading },
      { button: this.checkinButton, heading: this.checkinHeading },
    ];

    this.settingsItems = [
      { button: this.userLogsButton, heading: this.userLogsHeading },
      { button: this.vacanciesManagementButton, heading: this.vacanciesManagementHeading },
      { button: this.usersManagementButton, heading: this.usersManagementHeading },
    ];
  }
}
