import { expect, mergeTests } from '@playwright/test';
import { discountTest } from 'tests/fixtures/discountTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(discountTest, authenticationTest);

test.describe('Gestão de descontos', () => {
  test('cria, edita e exclui um desconto', async ({ authentication, discount }) => {
    await authentication.login(testsConfig.users.adminUser);
    await discount.open();

    await discount.createDiscount();
    await expect(discount.createdToast).toBeVisible();
    await expect(discount.createdRow()).toBeVisible();

    await discount.editDiscount();
    await expect(discount.updatedToast).toBeVisible();
    await expect(discount.editedRow()).toBeVisible();
    await expect(discount.createdRow()).toBeHidden();

    await discount.deleteDiscount();
    await expect(discount.deletedToast).toBeVisible();
    await expect(discount.editedRow()).toBeHidden();
  });
});
