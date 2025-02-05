import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'common',
  testDir: 'tests/test-cases/common',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
