import { expect, mergeTests } from '@playwright/test';
import { roomTest } from 'tests/fixtures/roomTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(roomTest, authenticationTest);

test.describe('Room flow', () => {
  test('Verify if it is possible to create, add campers and delete a room', async ({ authentication, room }) => {
    const testCredentials = testsConfig.users.testUser;
    const camperId = process.env.ROOM_TEST_CAMPER_ID || '492';

    await authentication.login(testCredentials);

    await room.roomsButton.click();
    await expect(room.roomsHeading).toBeVisible();
    await room.createNewRoom();
    await expect(room.roomCreatedToast).toBeVisible();

    await room.fillRoom(camperId);
    await expect(room.campersInsideRoom).toHaveCount(1, { timeout: 10_000 });

    await room.deleteRoomButton.click();
    await expect(room.confirmDeleteRoomModal).toBeVisible();
    await room.confirmDeleteRoomButton.click();
    await expect(room.roomDeletedToast).toBeVisible();
    await expect(room.roomAccordion).toBeHidden();
  });
});
