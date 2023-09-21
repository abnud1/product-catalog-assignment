// eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
const nextJest = require("next/jest") as Awaited<
  typeof import("next/jest")
>["default"];

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
};

// eslint-disable-next-line unicorn/prefer-module
module.exports = createJestConfig(customJestConfig);
