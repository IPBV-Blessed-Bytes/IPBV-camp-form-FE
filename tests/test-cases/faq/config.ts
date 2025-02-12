import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'faq',
  testDir: 'tests/test-cases/faq',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
