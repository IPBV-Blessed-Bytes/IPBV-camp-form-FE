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

		commonUser: {
			email: process.env.COMMON_EMAIL!,
			password: process.env.COMMON_PASSWORD!,
		},
	},
};
