import { expect } from '@playwright/test';
import { formTest as test } from 'tests/fixtures/formTest';

test.describe('Form flow — adulto', () => {
  test('preenche o fluxo completo de um adulto até o carrinho', async ({ form, page }) => {
    await form.open();

    await form.fillWholeFlow(
      {
        name: 'Adulto Teste E2E',
        cpf: '52998224725',
        birthday: '15/04/1990',
        gender: 'Adulto Masculino',
      },
      { phone: '81999998888', email: 'adulto.e2e@teste.com' },
    );

    // No carrinho (BeforePayment): há o botão de adicionar acampante e o CTA de login (deslogado).
    await expect(page.getByRole('button', { name: 'Adicionar Acampante' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fazer login para continuar' })).toBeVisible();
  });
});
