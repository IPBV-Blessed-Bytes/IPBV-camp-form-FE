import { expect, mergeTests } from '@playwright/test';
import { commonTest } from 'tests/fixtures/commonTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(commonTest, authenticationTest);

// Cards que cada papel DEVE e NÃO DEVE ver no painel.
const ALL_CARDS = [
  'Inscrições',
  'Caronas',
  'Ônibus',
  'Descontos',
  'Quartos',
  'Times',
  'Feedbacks',
  'Check-in',
  'Boletos',
  'Doações',
  'Configurações',
];

const ROLE_CARDS: Record<string, string[]> = {
  admin: ALL_CARDS,
  collaborator: ['Inscrições', 'Caronas', 'Ônibus', 'Descontos', 'Quartos', 'Times', 'Feedbacks'],
  collaboratorViewer: ['Inscrições', 'Ônibus', 'Descontos'],
  checker: ['Check-in'],
};

const assertCards = async (permission: any, visible: string[]) => {
  for (const title of ALL_CARDS) {
    const card = permission.card(title);
    if (visible.includes(title)) {
      await expect(card, `esperava ver o card "${title}"`).toBeVisible();
    } else {
      await expect(card, `NÃO esperava ver o card "${title}"`).toBeHidden();
    }
  }
};

test.describe('Permissões por papel', () => {
  test('admin vê todos os cards e pode criar inscrição', async ({ authentication, permission, page }) => {
    await authentication.login(testsConfig.users.adminUser);
    await expect(page.getByRole('button', { name: 'Acessar Painel' })).toBeHidden();
    await assertCards(permission, ROLE_CARDS.admin);
    await permission.openCampers();
    await page.waitForLoadState('networkidle');
    // Na tabela de inscritos, o admin pode criar uma nova inscrição.
    await expect(permission.newCamperButton).toBeVisible();
  });

  test('collaborator vê o subconjunto de cards de gestão', async ({ authentication, permission, page }) => {
    await authentication.login(testsConfig.users.collaboratorUser);
    await expect(page.getByRole('button', { name: 'Acessar Painel' })).toBeHidden();
    await assertCards(permission, ROLE_CARDS.collaborator);
  });

  test('collaborator viewer vê apenas inscrições/ônibus/descontos', async ({ authentication, permission, page }) => {
    await authentication.login(testsConfig.users.collaboratorViewer);
    await expect(page.getByRole('button', { name: 'Acessar Painel' })).toBeHidden();
    await assertCards(permission, ROLE_CARDS.collaboratorViewer);
  });

  test('checker vê apenas o card de check-in', async ({ authentication, permission, page }) => {
    await authentication.login(testsConfig.users.checkerUser);
    await expect(page.getByRole('button', { name: 'Acessar Painel' })).toBeHidden();
    await assertCards(permission, ROLE_CARDS.checker);
  });
});
