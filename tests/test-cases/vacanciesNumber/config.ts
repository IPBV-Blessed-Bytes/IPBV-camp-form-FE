import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'vacanciesNumber',
  testDir: 'tests/test-cases/vacanciesNumber',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
