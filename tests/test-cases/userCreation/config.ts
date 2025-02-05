import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'userCreation',
  testDir: 'tests/test-cases/userCreation',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
