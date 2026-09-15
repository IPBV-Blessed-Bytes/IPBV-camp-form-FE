import { expect, mergeTests } from '@playwright/test';
import { adminHomeTest } from 'tests/fixtures/adminHomeTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(adminHomeTest, authenticationTest);

// Cada card do painel leva a uma subpágina com um heading conhecido.
const SECTIONS: { card: string; heading: string }[] = [
  { card: 'Inscrições', heading: 'Inscrições' },
  { card: 'Boletos', heading: 'Boletos' },
  { card: 'Doações', heading: 'Doações' },
  { card: 'Caronas', heading: 'Caronas' },
  { card: 'Ônibus', heading: 'Ônibus' },
  { card: 'Descontos', heading: 'Descontos' },
  { card: 'Quartos', heading: 'Quartos' },
  { card: 'Times', heading: 'Times' },
  { card: 'Check-in', heading: 'Check-in de Usuário' },
];

test.describe('Admin home', () => {
  test('login como admin e navegação pelas seções do painel', async ({ authentication, adminHome, page }) => {
    await authentication.login(testsConfig.users.adminUser);

    await expect(page.getByRole('heading', { name: 'Painel Administrativo' })).toBeVisible();

    for (const section of SECTIONS) {
      await adminHome.openSection(section.card);
      await expect(adminHome.heading(section.heading)).toBeVisible();
      await adminHome.goBack();
      await expect(page.getByRole('heading', { name: 'Painel Administrativo' })).toBeVisible();
    }

    await authentication.logout();
    await expect(authentication.adminAccess).toBeVisible();
  });
});
