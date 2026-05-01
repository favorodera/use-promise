/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    testTimeout: 0,
    environment: 'node',
    clearMocks: true,
  },
})
