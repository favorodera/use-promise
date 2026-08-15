import { defineConfig } from 'relizy'

export default defineConfig({
  projectName: 'use-promise',
  publish: {
    access: 'public',
    buildCmd: 'pnpm build',
    packageManager: 'pnpm',
    registry: 'https://registry.npmjs.org',
  },
  types: {
    build: { semver: 'patch', title: 'Builds' },
    chore: { semver: 'patch', title: 'Chores' },
    ci: { semver: 'patch', title: 'Continuous Integrations' },
    docs: { semver: 'patch', title: 'Documentation' },
    feat: { semver: 'minor', title: 'Added' },
    fix: { semver: 'patch', title: 'Fixed' },
    perf: { semver: 'patch', title: 'Performance' },
    refactor: { semver: 'patch', title: 'Refactors' },
    style: { semver: 'patch', title: 'Styling' },
    test: { semver: 'patch', title: 'Tests' },
  },
})
