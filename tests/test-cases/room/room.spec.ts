import { expect, mergeTests } from '@playwright/test';
import { roomTest } from 'tests/fixtures/roomTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(roomTest, authenticationTest);

test.describe('Room flow', () => {
  test('Verify if it is possible to create, add campers and delete a room', async ({ authentication, room }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);

    await room.roomsButton.click();
    await expect(room.roomsHeading).toBeVisible();
    await room.createNewRoom();

    await room.fillRoom();
    await expect(room.campersInsideRoom.nth(0)).toHaveText('Acsa Gabriely Farias Nascimento Souza - ');
    await expect(room.campersInsideRoom.nth(1)).toHaveText('Agatha Gabriela Paiva de Lima - ');

    await room.deleteRoomButton.click();
    await expect(room.confirmDeleteRoomModal).toBeVisible();
    await room.confirmDeleteRoomButton.click();
    await expect(room.roomAccordion).toBeHidden();
  });
});
