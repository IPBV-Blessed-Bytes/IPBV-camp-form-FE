import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'form',
  testDir: 'tests/test-cases/form',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
