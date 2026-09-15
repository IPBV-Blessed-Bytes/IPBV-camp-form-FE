import { expect, mergeTests } from '@playwright/test';
import { roomTest } from 'tests/fixtures/roomTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(roomTest, authenticationTest);

test.describe('Gestão de quartos', () => {
  test('cria um quarto, adiciona um acampante e exclui o quarto', async ({ authentication, room }) => {
    await authentication.login(testsConfig.users.adminUser);
    await room.open();

    await room.createRoom();
    await expect(room.createdToast).toBeVisible();
    await expect(room.roomHeader()).toBeVisible();

    await room.addFirstCamper();
    await expect(room.addedCamperToast).toBeVisible();
    await expect(room.campersInRoom().first()).toBeVisible();

    await room.deleteRoom();
    await expect(room.deletedToast).toBeVisible();
    await expect(room.roomHeader()).toBeHidden();
  });
});
