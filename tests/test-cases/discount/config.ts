import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'discount',
  testDir: 'tests/test-cases/discount',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
