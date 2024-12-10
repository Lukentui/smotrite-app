import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'happy-dom',
    isolate: true,
    testTimeout: 30000,
    coverage: {
        provider: 'v8'
    },
  },
}))
