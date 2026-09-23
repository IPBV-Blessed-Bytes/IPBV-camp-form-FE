import { Locator, Page } from '@playwright/test';

export class FormBuilderComponent {
  readonly title: Locator;
  readonly templatesTitle: Locator;
  readonly acampamentoTemplate: Locator;
  readonly congressoTemplate: Locator;
  readonly retiroTemplate: Locator;
  readonly fieldsManagerTitle: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByRole('heading', { name: 'Construtor de Formulário' });
    this.templatesTitle = page.getByText('Comece com um modelo pronto');
    this.acampamentoTemplate = page.locator('.form-builder__template-name', { hasText: 'Acampamento' });
    this.congressoTemplate = page.locator('.form-builder__template-name', { hasText: 'Congresso' });
    this.retiroTemplate = page.locator('.form-builder__template-name', { hasText: 'Retiro' });
    this.fieldsManagerTitle = page.getByRole('heading', { name: 'Campos administrativos' });
  }

  async gotoFormBuilder() {
    await this.page.goto('/admin/formulario', { waitUntil: 'commit' });
  }

  async gotoFieldsManager() {
    await this.page.goto('/admin/campos-admin', { waitUntil: 'commit' });
  }
}
