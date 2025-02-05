import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'dataPanel',
  testDir: 'tests/test-cases/dataPanel',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
