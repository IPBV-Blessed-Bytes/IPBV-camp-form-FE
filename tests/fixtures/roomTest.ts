import { test } from '@playwright/test';
import { RoomComponent } from 'tests/pages/RoomPage';

interface RoomTest {
    room: RoomComponent;
}

export const roomTest = test.extend<RoomTest>({
  room: async ({ page }, use) => {
    await use(new RoomComponent(page));
  },
});
