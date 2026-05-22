import { test } from '@playwright/test';
import { RoomComponent } from 'tests/pages/RoomPage';
import { setupPage } from 'tests/fixtures/setupPage';

interface RoomTest {
  room: RoomComponent;
}

export const roomTest = test.extend<RoomTest>({
  room: async ({ page }, use) => {
    await setupPage(page);
    await use(new RoomComponent(page));
  },
});
