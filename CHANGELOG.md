# Changelog

## v1.0.0...v1.0.1

[compare changes](https://github.com/favorodera/use-promise/compare/v1.0.0...v1.0.1)

### Fixed

- **ci:** Fix syntax error in preview publish step ([e779cff](https://github.com/favorodera/use-promise/commit/e779cff))

### Documentation

- Improve variable naming in usePromise example ([e869b81](https://github.com/favorodera/use-promise/commit/e869b81))
- **readme:** Update project description in header ([e71d65e](https://github.com/favorodera/use-promise/commit/e71d65e))

  - Fix placeholder tagline in header block
  - Remove duplicate description text below badges

- **readme:** Update PromiseState type definition ([a40faf2](https://github.com/favorodera/use-promise/commit/a40faf2))

  - Align state shape docs with actual types
  - Include undefined in data and error unions


### Chores

- Add keywords to package.json ([cc1248c](https://github.com/favorodera/use-promise/commit/cc1248c))
- Modernize project configuration and types ([46499d7](https://github.com/favorodera/use-promise/commit/46499d7))

  - Switch initial state values from null to undefined
  - Upgrade dependencies and ESLint configuration
  - Update GitHub templates to form-based YAML
  - Refactor release and CI workflows with actions v7

- **ci:** Simplify package build and publish ([2966416](https://github.com/favorodera/use-promise/commit/2966416))

  - Remove redundant workspace package filters
  - Rely on default package discovery in CI tasks

- **ci:** Remove Vercel notification step ([4e8c715](https://github.com/favorodera/use-promise/commit/4e8c715))

### ❤️ Contributors

- Favour Emeka ([@favorodera](https://github.com/favorodera))


## v0.0.0...v1.0.0

[compare changes](https://github.com/favorodera/use-promise/compare/f06cffe74b9ba1c4dcf66647c1307da066de09c8...v1.0.0)

### Added

- Add release workflow using relizy ([0131196](https://github.com/favorodera/use-promise/commit/0131196))
- Add usePromise composable for async state management ([ebccdbf](https://github.com/favorodera/use-promise/commit/ebccdbf))
- Add toError utility to safely coerce unknown errors ([dd207c6](https://github.com/favorodera/use-promise/commit/dd207c6))
- Add `reset` function and re-export types ([3980d71](https://github.com/favorodera/use-promise/commit/3980d71))

### Refactors

- Migrate project to native ES modules ([dd500a2](https://github.com/favorodera/use-promise/commit/dd500a2))
- Add PromiseState type ([b311e1d](https://github.com/favorodera/use-promise/commit/b311e1d))
- Rename TReturn to TData in PromiseState type ([4553f98](https://github.com/favorodera/use-promise/commit/4553f98))

### Documentation

- Add Contributor Covenant Code of Conduct ([0474350](https://github.com/favorodera/use-promise/commit/0474350))
- Add contributing guidelines ([55d2900](https://github.com/favorodera/use-promise/commit/55d2900))
- Add feature request issue template ([60d4aec](https://github.com/favorodera/use-promise/commit/60d4aec))
- Rewrite README to introduce usePromise composable ([b0e1102](https://github.com/favorodera/use-promise/commit/b0e1102))
- Update README with Nuxt auto-import guide and API clarifications ([13e4569](https://github.com/favorodera/use-promise/commit/13e4569))
- Fix state property access in Vue example ([654f9e5](https://github.com/favorodera/use-promise/commit/654f9e5))
- Add multiple usage examples and improve README formatting ([5fe5417](https://github.com/favorodera/use-promise/commit/5fe5417))
- Add project badges to README ([6148347](https://github.com/favorodera/use-promise/commit/6148347))
- Improve badge readability in README ([a793389](https://github.com/favorodera/use-promise/commit/a793389))

### Tests

- Remove MyButton test file ([caef942](https://github.com/favorodera/use-promise/commit/caef942))
- Add tests for usePromise ([5d0ee97](https://github.com/favorodera/use-promise/commit/5d0ee97))
- Expand and refactor usePromise test suite ([17f7b52](https://github.com/favorodera/use-promise/commit/17f7b52))
- Add async test utilities ([76813cf](https://github.com/favorodera/use-promise/commit/76813cf))

### Styling

- Enhance `toError` function clarity with JSDoc and explicit return type ([6732a12](https://github.com/favorodera/use-promise/commit/6732a12))

### ❤️ Contributors

- Favour Emeka ([@favorodera](https://github.com/favorodera))


## v1.0.0-alpha.0...v1.0.0-alpha.1

[compare changes](https://github.com/favorodera/use-promise/compare/v1.0.0-alpha.0...v1.0.0-alpha.1)

### Styling

- Enhance `toError` function clarity with JSDoc and explicit return type ([6732a12](https://github.com/favorodera/use-promise/commit/6732a12))

### ❤️ Contributors

- Favour Emeka ([@favorodera](https://github.com/favorodera))


## v0.0.0...v1.0.0-alpha.0

[compare changes](https://github.com/favorodera/use-promise/compare/f06cffe74b9ba1c4dcf66647c1307da066de09c8...v1.0.0-alpha.0)

### 🚀 Enhancements

- Add release workflow using relizy ([0131196](https://github.com/favorodera/use-promise/commit/0131196))
- Add usePromise composable for async state management ([ebccdbf](https://github.com/favorodera/use-promise/commit/ebccdbf))
- Add toError utility to safely coerce unknown errors ([dd207c6](https://github.com/favorodera/use-promise/commit/dd207c6))
- Add `reset` function and re-export types ([3980d71](https://github.com/favorodera/use-promise/commit/3980d71))

### 💅 Refactors

- Migrate project to native ES modules ([dd500a2](https://github.com/favorodera/use-promise/commit/dd500a2))
- Add PromiseState type ([b311e1d](https://github.com/favorodera/use-promise/commit/b311e1d))
- Rename TReturn to TData in PromiseState type ([4553f98](https://github.com/favorodera/use-promise/commit/4553f98))

### 📖 Documentation

- Add Contributor Covenant Code of Conduct ([0474350](https://github.com/favorodera/use-promise/commit/0474350))
- Add contributing guidelines ([55d2900](https://github.com/favorodera/use-promise/commit/55d2900))
- Add feature request issue template ([60d4aec](https://github.com/favorodera/use-promise/commit/60d4aec))
- Rewrite README to introduce usePromise composable ([b0e1102](https://github.com/favorodera/use-promise/commit/b0e1102))
- Update README with Nuxt auto-import guide and API clarifications ([13e4569](https://github.com/favorodera/use-promise/commit/13e4569))

### ❤️ Contributors

- Favour Emeka ([@favorodera](https://github.com/favorodera))
