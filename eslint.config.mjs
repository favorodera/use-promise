import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/**/*.js', '**/**/*.mjs', '**/**/*.vue', '**/**/*.ts'],
  },

  globalIgnores([
    '**/dist/**',
    '**/coverage/**',
    '**/node_modules/**',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
  ]),

  vueTsConfigs.recommended,

  {
    files: ['**/**/__tests__/*'],
    ...pluginVitest.configs.recommended,
  },

  {
    plugins: { '@stylistic': stylistic },
    rules: { ...stylistic.configs.recommended.rules },
  },

  {
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 2, maxBOF: 0 }],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/no-trailing-spaces': ['error', { skipBlankLines: true }],
      '@stylistic/brace-style': 'off',
    },
  },
)
