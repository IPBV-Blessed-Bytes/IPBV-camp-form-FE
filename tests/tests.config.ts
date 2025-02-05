import { loadEnvFile } from 'process';

loadEnvFile(process.cwd() + '/.env');

export const testsConfig = {
	environment: {
		testBaseURL: process.env.TEST_BASE_URL!,
	},

	users: {
		adminUser: {
			email: process.env.ADMIN_EMAIL!,
			password: process.env.ADMIN_PASSWORD!,
		},

		checkerUser: {
			email: process.env.CHECKER_EMAIL!,
			password: process.env.CHECKER_PASSWORD!,
		},
	},
};
