import nextJest from "next/jest";
import dotenv from "dotenv";

// Load environment variables early
dotenv.config({ path: ".env.local" });

const createJestConfig = nextJest({
	dir: "./", // Root directory for Next.js app
});

const customJestConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Setup file for Jest
	testEnvironment: "jest-environment-jsdom", // Simulate browser environment
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1", // Support for absolute imports
	},
	globals: {
		"ts-jest": {
			tsconfig: "<rootDir>/tsconfig.jest.json", // Separate tsconfig for Jest if needed
		},
	},
};

export default createJestConfig(customJestConfig);
