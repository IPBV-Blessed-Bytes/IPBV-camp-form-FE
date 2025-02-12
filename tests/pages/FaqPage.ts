import { Locator, Page } from '@playwright/test';

export class FaqComponent {
  readonly infoButton: Locator;
  readonly ageToast: Locator;
  readonly faqButton: Locator;
  readonly faqHeading: Locator;
  readonly firstQuestionButton: Locator;
  readonly firstQuestionContent: Locator;
  readonly secondQuestionButton: Locator;
  readonly secondQuestionContent: Locator;
  readonly thirdQuestionButton: Locator;
  readonly thirdQuestionContent: Locator;
  readonly question: Locator;
  readonly backButton: Locator;
  readonly formMainTitle: Locator;

  constructor(readonly page: Page) {
    this.infoButton = page.getByRole('button').filter({ hasText: /^$/ });
    this.ageToast = page.getByRole('button', { name: 'close' });
    this.faqButton = page.getByRole('button', { name: 'Perguntas Frequentes' });
    this.faqHeading = page.getByText('Perguntas Frequentes:');
    this.firstQuestionButton = page.getByRole('button', { name: '1. Como faço minha inscrição' });
    this.firstQuestionContent = page.getByText('Você pode fazer sua inscrição');
    this.secondQuestionButton = page.getByRole('button', { name: '13. Meu filho menor de idade' });
    this.secondQuestionContent = page.getByText('Sim, você deve digitalizar e');
    this.thirdQuestionButton = page.getByRole('button', { name: 'Posso escolher meu quarto?' });
    this.thirdQuestionContent = page.getByText('Não é possível escolher');
    this.question = page.locator('.accordion-header');
    this.backButton = page.getByRole('button', { name: 'Voltar pro formulário' });
    this.formMainTitle = page.getByRole('heading', { name: 'Acampamento no período de' });
  }

  async openFaqPage() {
    await this.infoButton.click();
    await this.faqButton.click();
  }
}
