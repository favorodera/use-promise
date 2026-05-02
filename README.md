# usePromise

A Vue composable for async operations with reactive state, cancellation, and race-condition safety.

```bash
npm install @favorodera/use-promise
```

---

## Nuxt Auto-Import

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    presets: [
      {
        from: '@favorodera/use-promise',
        imports: ['usePromise'],
      },
    ],
  },
})
```

`usePromise` will be available globally — no import needed in composables or components.

---

## Usage

```ts
import { usePromise } from '@favorodera/use-promise'

const { state, execute, abort, reset } = usePromise(
  async (signal, id: string) => {
    const res = await fetch(`/api/users/${id}`, { signal })
    return res.json()
  }
)

execute('123')
```

---

## API

### `usePromise(callback)`

| Parameter  | Type                                              | Description                              |
| ---------- | ------------------------------------------------- | ---------------------------------------- |
| `callback` | `(signal: AbortSignal, ...args) => Promise<TData>` | Async function to manage. Receives an `AbortSignal` as its first argument. |

**Returns**

| Name      | Type                          | Description                                              |
| --------- | ----------------------------- | -------------------------------------------------------- |
| `state`   | `Readonly<Ref<PromiseState>>` | Reactive state object                                    |
| `execute` | `(...args) => Promise<TData \| undefined>` | Runs the callback. Cancels any in-flight request first. Returns the resolved value, or `undefined` on failure. |
| `abort`   | `() => void`                  | Cancels the in-flight request silently. Does not set error state. |
| `reset`   | `() => void`                  | Aborts and returns state to `idle`.                      |

---

## State Shape

```ts
type PromiseState<TData, TError extends Error = Error> =
  | { status: 'idle';    data: null;          error: null   }
  | { status: 'pending'; data: TData | null;  error: null   }
  | { status: 'success'; data: TData;         error: null   }
  | { status: 'error';   data: TData | null;  error: TError }
```

`data` is preserved across `pending` and `error` states — no UI flicker on reload or failure.

---

## Behaviour

**Auto-cancellation** — `execute()` aborts the previous request before starting a new one.

**Race-condition safe** — only the latest execution updates state, even if an earlier one resolves last.

**Signal-agnostic** — callbacks that don't honour `AbortSignal` are still protected via an internal execution ID.

**Silent abort** — `abort()` and `reset()` never write to `state.error`.

---

## Example

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { state, execute } = usePromise(
  async (signal, id: string) => {
    const response = await fetch(`/api/users/${id}`, { signal })
    return response.json()
  }
)

execute('123')
</script>

<template>
  <div v-if="state.status === 'pending'">Loading...</div>
  <div v-else-if="state.status === 'error'">{{ state.error?.message }}</div>
  <div v-else>{{ state.data }}</div>
</template>
```