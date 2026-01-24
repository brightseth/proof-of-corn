import type { Config } from 'jest'
import nextJest from 'next/jest.js'

// Create Next.js Jest configuration
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.ts and .env files in your test environment
  dir: './',
})

// Custom Jest configuration
const config: Config = {
  // Use jsdom for testing React components
  testEnvironment: 'jsdom',

  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module path aliases (matching tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
}

// Export config with Next.js configuration applied
export default createJestConfig(config)
