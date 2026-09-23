import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'storefront',
  testDir: 'tests/test-cases/storefront',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
