import { expect, mergeTests } from '@playwright/test';
import { rideTest } from 'tests/fixtures/rideTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, rideTest);

test.describe('Ride flow', () => {
  test('Navigates to ride page and verifies sections render', async ({ authentication, ride }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);
    await ride.navigateToRidePage();

    await expect(ride.heading).toBeVisible();
    await expect(ride.downloadReportButton).toBeVisible();
    await expect(ride.offerRideAccordion).toBeVisible();
    await expect(ride.needRideAccordion).toBeVisible();
  });

  test('Expands ride sections and shows their tables', async ({ authentication, ride }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);
    await ride.navigateToRidePage();
    await expect(ride.heading).toBeVisible();

    await ride.expandOfferRide();
    await expect(ride.offerRideTable).toBeVisible();

    await ride.expandNeedRide();
    await expect(ride.needRideTable).toBeVisible();
  });
});
