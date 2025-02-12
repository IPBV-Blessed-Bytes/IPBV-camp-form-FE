import { expect, mergeTests } from '@playwright/test';
import { discountTest } from 'tests/fixtures/discountTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(discountTest, authenticationTest);

test.describe('Discount table flow', () => {
  test('Verify if it is possible to create, edit and delete a discount', async ({ authentication, discount }) => {
    await authentication.goToAdminPage();

    const adminPassword = testsConfig.users.testUser;
    await authentication.login(adminPassword);
    await discount.discountButton.click();
    await expect(discount.discountHeading).toBeVisible();

    await discount.createNewDiscount();
    await expect(discount.discountCreatedToast).toBeVisible();
    await expect(discount.discountCreated).toBeVisible();

    await discount.editButton.click();
    await expect(discount.cpfAttachedInput).toHaveValue('00000000011');
    await expect(discount.discountValueInput).toHaveValue('100');
    await discount.fillDataToEditDiscount();
    await expect(discount.discountUpdatedToast).toBeVisible();
    await expect(discount.discountUpdated).toBeVisible();
    await expect(discount.discountCreated).toBeHidden();

    await discount.deleteButton.click();
    await expect(discount.deleteDiscountModal).toBeVisible();
    await discount.confirmDeleteDiscountButton.click();
    await expect(discount.discountDeletedToast).toBeVisible();
    await expect(discount.discountUpdated).toBeHidden();
  });
});
