import { Locator, Page } from '@playwright/test';

export class FaqComponent {
  readonly questions: Locator;
  readonly accordionButtons: Locator;
  readonly backButton: Locator;
  readonly formMainTitle: Locator;

  constructor(readonly page: Page) {
    this.questions = page.locator('.accordion-header');
    this.accordionButtons = page.locator('.accordion-button');
    this.backButton = page.getByRole('button', { name: /Voltar/i });
    this.formMainTitle = page.getByRole('heading', { name: 'ACAMPAMENTO IPBV 2027' });
  }

  async openFaqPage() {
    await this.page.goto('/perguntas', { waitUntil: 'networkidle' });
  }

  async firstQuestion(): Promise<Locator> {
    return this.accordionButtons.first();
  }
}
