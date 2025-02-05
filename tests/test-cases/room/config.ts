import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'room',
  testDir: 'tests/test-cases/room',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
