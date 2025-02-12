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
    this.discountButton = page.getByText('Descontos');
    this.discountHeading = page.getByRole('heading', { name: 'Gerenciamento de Descontos' });
    this.createNewDiscountButton = page.getByRole('button', { name: 'Criar Novo Desconto' });
    this.cpfAttachedInput = page.getByPlaceholder('00000000000', { exact: true });
    this.discountValueInput = page.getByPlaceholder('000', { exact: true });
    this.confirmCreateDiscountButton = page.getByRole('button', { name: 'Criar Desconto' });
    this.discountCreatedToast = page.getByText('Desconto criado com sucesso');
    this.discountCreated = page
      .locator('tbody tr')
      .filter({
        has: page.locator('td').nth(0).filter({ hasText: '00000000011' }),
      })
      .filter({
        has: page.locator('td').nth(1).filter({ hasText: '100' }),
      });
    this.editButton = page.getByRole('row', { name: '100' }).getByRole('button').first();
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.discountUpdatedToast = page.getByText('Desconto atualizado com sucesso');
    this.discountUpdated = page
      .locator('tbody tr')
      .filter({
        has: page.locator('td').nth(0).filter({ hasText: '00000000022' }),
      })
      .filter({
        has: page.locator('td').nth(1).filter({ hasText: '200' }),
      });

    this.deleteButton = page.getByRole('row', { name: '200' }).getByRole('button').nth(1);
    this.deleteDiscountModal = page.locator('div').filter({ hasText: 'Excluir Desconto' }).nth(3);
    this.confirmDeleteDiscountButton = page.getByRole('button', { name: 'Excluir' });
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
