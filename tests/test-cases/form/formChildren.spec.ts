import { expect } from '@playwright/test';
import { formTest as test } from 'tests/fixtures/formTest';

test.describe('Form flow — criança', () => {
  test('preenche o fluxo completo de uma criança (com responsável legal) até o carrinho', async ({ form, page }) => {
    await form.open();

    await form.fillWholeFlow(
      {
        name: 'Criança Teste E2E',
        cpf: '52998224725',
        birthday: '10/03/2020',
        gender: 'Criança (até 10 anos)',
        guardianName: 'Responsável Teste',
        guardianCpf: '11144477735',
        guardianPhone: '81988887777',
      },
      { phone: '81999998888', email: 'crianca.e2e@teste.com' },
    );

    await expect(page.getByRole('button', { name: 'Adicionar Acampante' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fazer login para continuar' })).toBeVisible();
  });
});
