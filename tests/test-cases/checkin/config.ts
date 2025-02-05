import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'checkin',
  testDir: 'tests/test-cases/checkin',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
