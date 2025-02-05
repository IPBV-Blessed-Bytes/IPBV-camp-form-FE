import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'camperTable',
  testDir: 'tests/test-cases/camperTable',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
