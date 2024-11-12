module.exports = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest'
	},
	testEnvironment: 'jest-environment-jsdom',
	setupFiles: ['jest-webextension-mock', '<rootDir>/test-utils/setupTests.ts'],
	transformIgnorePatterns: ['node_modules/(?!@orama/orama)']
};
