import { test } from '@playwright/test';
import { RideComponent } from 'tests/pages/RidePage';

interface RideTest {
    ride: RideComponent;
}

export const rideTest = test.extend<RideTest>({
  ride: async ({ page }, use) => {
    await use(new RideComponent(page));
  },
});
