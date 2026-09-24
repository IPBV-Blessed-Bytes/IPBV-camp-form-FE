import { Locator, Page } from '@playwright/test';

export class DiscountComponent {
  readonly discountHeading: Locator;
  readonly createNewDiscountButton: Locator;
  readonly cpfAttachedInput: Locator;
  readonly discountValueInput: Locator;
  readonly confirmCreateDiscountButton: Locator;
  readonly discountCreatedToast: Locator;
  readonly discountCreated: Locator;
  readonly editButton: Locator;
  readonly saveChangesButton: Locator;
  readonly discountUpdatedToast: Locator;
  readonly discountUpdated: Locator;
  readonly deleteButton: Locator;
  readonly deleteDiscountModal: Locator;
  readonly confirmDeleteDiscountButton: Locator;
  readonly discountDeletedToast: Locator;

  constructor(readonly page: Page) {
    this.discountHeading = page.getByRole('heading', { level: 1, name: 'Descontos' });
    this.createNewDiscountButton = page.getByRole('button', { name: 'Criar Novo Desconto' });
    this.cpfAttachedInput = page.getByPlaceholder('000.000.000-00');
    this.discountValueInput = page.getByPlaceholder('000', { exact: true });
    this.confirmCreateDiscountButton = page.getByRole('button', { name: 'Criar Desconto' });
    this.discountCreatedToast = page.getByText('Desconto criado com sucesso');
    this.discountCreated = page.getByRole('row').filter({ hasText: '000.000.000-11' });
    this.editButton = this.discountCreated.getByRole('button', { name: 'Editar desconto' });
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.discountUpdatedToast = page.getByText('Desconto atualizado com sucesso');
    this.discountUpdated = page.getByRole('row').filter({ hasText: '000.000.000-22' });
    this.deleteButton = this.discountUpdated.getByRole('button', { name: 'Excluir desconto' });
    this.deleteDiscountModal = page.locator('.modal-title', { hasText: 'Excluir Desconto' });
    this.confirmDeleteDiscountButton = page.getByRole('button', { name: 'Excluir', exact: true });
    this.discountDeletedToast = page.getByText('Desconto excluído com sucesso');
  }

  async openDiscountPage() {
    await this.page.goto('/admin/descontos', { waitUntil: 'commit' });
  }

  async createNewDiscount() {
    await this.createNewDiscountButton.click();
    await this.cpfAttachedInput.fill('00000000011');
    await this.discountValueInput.fill('100');
    await this.confirmCreateDiscountButton.click();
  }

  async fillDataToEditDiscount() {
    await this.cpfAttachedInput.fill('00000000022');
    await this.discountValueInput.fill('200');
    await this.saveChangesButton.click();
  }
}
