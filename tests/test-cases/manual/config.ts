import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'manual',
  testDir: 'tests/test-cases/manual',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
