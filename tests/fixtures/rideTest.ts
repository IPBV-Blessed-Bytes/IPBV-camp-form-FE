import { test } from '@playwright/test';
import { RideComponent } from 'tests/pages/RidePage';
import { setupPage } from 'tests/fixtures/setupPage';

interface RideTest {
  ride: RideComponent;
}

export const rideTest = test.extend<RideTest>({
  ride: async ({ page }, use) => {
    await setupPage(page);
    await use(new RideComponent(page));
  },
});
