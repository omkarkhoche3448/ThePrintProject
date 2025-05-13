// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  verbose: true
};
