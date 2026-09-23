import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'platformPanel',
  testDir: 'tests/test-cases/platform',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
