import { Locator, Page } from '@playwright/test';

export class DiscountComponent {
  readonly discountButton: Locator;
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
    this.discountButton = page.getByTestId('session-card-discount-card');
    this.discountHeading = page.getByRole('heading', { name: 'Gerenciamento de Descontos' });
    this.createNewDiscountButton = page.getByRole('button', { name: 'Criar Novo Desconto' });
    this.cpfAttachedInput = page.getByPlaceholder('00000000000', { exact: true });
    this.discountValueInput = page.getByPlaceholder('000', { exact: true });
    this.confirmCreateDiscountButton = page.getByRole('button', { name: 'Criar Desconto', exact: true });
    this.discountCreatedToast = page.getByText('Desconto criado com sucesso');
    this.discountCreated = page.getByTestId('discount-row-00000000011');
    this.editButton = page.getByTestId('discount-edit-00000000011');
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.discountUpdatedToast = page.getByText('Desconto atualizado com sucesso');
    this.discountUpdated = page.getByTestId('discount-row-00000000022');
    this.deleteButton = page.getByTestId('discount-delete-00000000022');
    this.deleteDiscountModal = page.getByRole('dialog').filter({ hasText: 'Excluir Desconto' });
    this.confirmDeleteDiscountButton = page.getByRole('button', { name: 'Excluir', exact: true });
    this.discountDeletedToast = page.getByText('Desconto excluído com sucesso');
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
