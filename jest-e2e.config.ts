import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    roots: ['<rootDir>/e2e/'],
    testRegex: '.*\\.e2e-spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '@/(.*)': '<rootDir>/src/$1',
        '@e2e/(.*)': '<rootDir>/e2e/$1',
    },
    testTimeout: 60000, // 1 minutes
};
export default config;
