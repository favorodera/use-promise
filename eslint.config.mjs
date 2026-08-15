import { factory } from '@favorodera/eslint-config'

export default factory({
  tailwind: false,
}).append({
  rules: {
    'pnpm/json-enforce-catalog': 'off',
  },
})
