import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'ride',
  testDir: 'tests/test-cases/ride',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
