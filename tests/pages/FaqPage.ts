import { Locator, Page } from '@playwright/test';

export class FaqComponent {
  readonly infoButton: Locator;
  readonly faqButton: Locator;
  readonly faqHeading: Locator;
  readonly inscriptionQuestionButton: Locator;
  readonly inscriptionQuestionContent: Locator;
  readonly childrenQuestionButton: Locator;
  readonly childrenQuestionContent: Locator;
  readonly roomQuestionButton: Locator;
  readonly roomQuestionContent: Locator;
  readonly question: Locator;
  readonly backButton: Locator;

  constructor(readonly page: Page) {
    this.infoButton = page.getByTestId('info-button');
    this.faqButton = page.getByTestId('info-menu-faq');
    this.faqHeading = page.getByText('Perguntas Frequentes:');
    this.inscriptionQuestionButton = page.getByRole('button', { name: /Como faço minha inscrição/ });
    this.inscriptionQuestionContent = page.getByText('Exclusivamente pelo link', { exact: false });
    this.childrenQuestionButton = page.getByRole('button', { name: /Meu filho menor de idade/ });
    this.childrenQuestionContent = page.getByText('Sim, você deve digitalizar', { exact: false });
    this.roomQuestionButton = page.getByRole('button', { name: /Posso escolher meu quarto\?/ });
    this.roomQuestionContent = page.getByText('Não é possível escolher quartos', { exact: false });
    this.question = page.locator('.accordion-header');
    this.backButton = page.getByRole('button', { name: 'Voltar' });
  }

  async openFaqPage() {
    await this.infoButton.click();
    await this.faqButton.click();
  }
}
