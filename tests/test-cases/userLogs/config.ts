import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'userLogs',
  testDir: 'tests/test-cases/userLogs',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
