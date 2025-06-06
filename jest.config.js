export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};
