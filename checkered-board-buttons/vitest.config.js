import { defineConfig } from 'vitest/config';

// Vitest configuration for testing PixiJS-based components
export default defineConfig({
  test: {
    // Use jsdom environment to simulate a browser for testing
    // This provides document, window, and other browser APIs that PixiJS expects
    environment: 'jsdom',
    
    // Setup file to run before each test
    // This will configure our PixiJS mocks and other test utilities
    setupFiles: ['./tests/setup.js'],
    
    // Enable canvas mocking for PixiJS graphics operations
    // vitest-canvas-mock provides fake Canvas API implementations
    server: {
      deps: {
        inline: ['vitest-canvas-mock']
      }
    },
    
    // Global test settings
    globals: true,
    
    // Files to include in test runs
    include: ['tests/**/*.test.js'],
    
    // Coverage configuration (optional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/'
      ]
    }
  }
});