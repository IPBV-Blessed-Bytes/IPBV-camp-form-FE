import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'authentication',
  testDir: 'tests/test-cases/authentication',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
