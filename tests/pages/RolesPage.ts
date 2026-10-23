import { Locator, Page } from '@playwright/test';

const ROLE_NAME = 'e2e-role';
const ROLE_LABEL = 'E2E Papel';
const ROLE_LABEL_EDITED = 'E2E Papel Editado';

export class RolesComponent {
  readonly heading: Locator;
  readonly createNewRoleButton: Locator;
  readonly createRoleModalTitle: Locator;
  readonly editRoleModalTitle: Locator;
  readonly nameInput: Locator;
  readonly displayNameInput: Locator;
  readonly createRoleButton: Locator;
  readonly saveChangesButton: Locator;
  readonly createdToast: Locator;
  readonly updatedToast: Locator;
  readonly deletedToast: Locator;
  readonly deleteModalTitle: Locator;
  readonly confirmDeleteButton: Locator;
  readonly modalBackdrop: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Papéis e Permissões' });
    this.createNewRoleButton = page.getByRole('button', { name: 'Criar Novo Papel' });
    this.createRoleModalTitle = page.locator('.modal-title', { hasText: 'Criar Papel' });
    this.editRoleModalTitle = page.locator('.modal-title', { hasText: 'Editar Papel' });
    this.nameInput = page.locator('#formRoleName');
    this.displayNameInput = page.locator('#formRoleLabel');
    this.createRoleButton = page.getByRole('button', { name: 'Criar Papel' });
    this.saveChangesButton = page.getByRole('button', { name: 'Salvar Alterações' });
    this.createdToast = page.getByText('Papel criado com sucesso');
    this.updatedToast = page.getByText('Papel atualizado com sucesso');
    this.deletedToast = page.getByText('Papel excluído com sucesso');
    this.deleteModalTitle = page.locator('.modal-title', { hasText: 'Confirmar Exclusão' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Excluir', exact: true });
    this.modalBackdrop = page.locator('.modal-backdrop');
  }

  async open() {
    await this.page.goto('/admin/papeis', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  createdRow = () => this.page.locator('tbody tr').filter({ hasText: ROLE_NAME });

  async createRole() {
    await this.createNewRoleButton.click();
    await this.nameInput.fill(ROLE_NAME);
    await this.displayNameInput.fill(ROLE_LABEL);
    await this.createRoleButton.click();
  }

  async editRole() {
    await this.createdRow().getByRole('button', { name: 'Editar papel' }).click();
    await this.displayNameInput.fill(ROLE_LABEL_EDITED);
    await this.saveChangesButton.click();
  }

  async deleteRole() {
    await this.createdRow().getByRole('button', { name: 'Excluir papel' }).click();
    await this.confirmDeleteButton.click();
  }
}
