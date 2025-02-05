import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'feedback',
  testDir: 'tests/test-cases/feedback',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
