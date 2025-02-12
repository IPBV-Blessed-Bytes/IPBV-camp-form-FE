import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'checkRegistration',
  testDir: 'tests/test-cases/checkRegistration',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
