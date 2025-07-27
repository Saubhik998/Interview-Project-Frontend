/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest preset for TypeScript
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Allow transformation of both .ts/.tsx and optionally .js/.jsx if needed
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // Uncomment next line if you also have JS/JSX and want to transform with babel-jest:
    // '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // By default, ignore node_modules except needed packages (for ESM)
  transformIgnorePatterns: [
    '/node_modules/(?!axios|html2pdf\\.js)/',
  ],

  // Map style imports to identity-obj-proxy (for CSS Modules)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Example: add static file mocks if you import images, e.g.
    // '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Run setup file after test environment is set up (good for global mocks)
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // (Optional) Include only these folders/files for coverage calculation
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // Omit barrel files from coverage if desired
  ],

  // (Optional) Coverage output customization
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],

  // (Optional) Minimum coverage thresholds to enforce
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
