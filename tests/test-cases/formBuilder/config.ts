import { Project } from '@playwright/test';
import { testsConfig } from 'tests/tests.config';

export const config: Project = {
  name: 'formBuilder',
  testDir: 'tests/test-cases/formBuilder',
  use: {
    baseURL: testsConfig.environment.testBaseURL,
  },
};
