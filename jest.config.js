const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

/** @type {import('@jest/types').Config.InitialOptions} */
const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/*/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
