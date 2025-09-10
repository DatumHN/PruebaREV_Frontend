import type { Config } from 'jest';

const config: Config = {
  displayName: 'landing',
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/../../setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  coverageDirectory: '<rootDir>/../../coverage/apps/landing',
  moduleNameMapper: {
    '^@revfa/auth-shared$': '<rootDir>/../../auth-shared/src/index.ts',
    '^@revfa/auth-shared/(.*)$': '<rootDir>/../../auth-shared/src/$1',
    '^@revfa/components/(.*)$': '<rootDir>/../../libs/src/lib/components/$1',
    '^@revfa/primeng-theme/(.*)$': '<rootDir>/../../libs/primeng-theme/src/$1',
    '^@revfa/routing/(.*)$': '<rootDir>/../../libs/src/$1',
    '^@revfa/shared-fonts/(.*)$': '<rootDir>/../../libs/shared-fonts/src/$1',
    '^landing/Routes$':
      '<rootDir>/../../apps/landing/src/app/remote-entry/entry.routes.ts',
    '^registry/Routes$':
      '<rootDir>/../../apps/registry/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
