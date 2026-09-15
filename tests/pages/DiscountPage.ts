import { Locator, Page } from '@playwright/test';

const CPF = '00000000011';
const CPF_EDITED = '00000000022';
const CPF_FMT = '000.000.000-11';
const CPF_EDITED_FMT = '000.000.000-22';

export class DiscountComponent {
  readonly heading: Locator;
  readonly createNewDiscountButton: Locator;
  readonly cpfAttachedInput: Locator;
  readonly discountValueInput: Locator;
  readonly confirmCreateDiscountButton: Locator;
  readonly createdToast: Locator;
  readonly updatedToast: Locator;
  readonly deletedToast: Locator;
  readonly saveChangesButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Descontos', exact: true });
    this.createNewDiscountButton = page.getByRole('button', { name: 'Criar Novo Desconto' });
    this.cpfAttachedInput = page.getByPlaceholder('000.000.000-00', { exact: true });
    this.discountValueInput = page.getByPlaceholder('000', { exact: true });
    this.confirmCreateDiscountButton = page.getByRole('button', { name: 'Criar Desconto' });
    this.createdToast = page.getByText('Desconto criado com sucesso');
    this.updatedToast = page.getByText('Desconto atualizado com sucesso');
    this.deletedToast = page.getByText('Desconto excluído com sucesso');
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Excluir', exact: true });
  }

  async open() {
    await this.page.goto('/admin/descontos', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  row(cpfFmt: string): Locator {
    return this.page.locator('tbody tr').filter({ has: this.page.locator('td', { hasText: cpfFmt }) });
  }

  createdRow = () => this.row(CPF_FMT);
  editedRow = () => this.row(CPF_EDITED_FMT);

  async createDiscount() {
    await this.createNewDiscountButton.click();
    await this.cpfAttachedInput.fill(CPF);
    await this.discountValueInput.fill('100');
    await this.confirmCreateDiscountButton.click();
  }

  async editDiscount() {
    await this.createdRow().getByRole('button').first().click();
    await this.cpfAttachedInput.fill(CPF_EDITED);
    await this.discountValueInput.fill('200');
    await this.saveChangesButton.click();
  }

  async deleteDiscount() {
    await this.editedRow().getByRole('button').nth(1).click();
    await this.confirmDeleteButton.click();
  }
}
