/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/app.ts',
    '!src/import-to-mongodb.ts',
    '!src/export-firestore.js',
    '!src/firestore_export/**',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
};
