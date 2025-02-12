import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'extraMeals',
  testDir: 'tests/test-cases/extraMeals',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
