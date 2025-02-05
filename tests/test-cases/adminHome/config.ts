import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'adminHome',
  testDir: 'tests/test-cases/adminHome',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
