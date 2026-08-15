<div align="center">
<h1><code>usePromise</code></h1>
<p><strong>A Vue composable for async operations with reactive state, cancellation, and race-condition safety.</strong></p>
<p>
<a href="https://npmx.dev/package/@favorodera/use-promise"><img src="https://img.shields.io/npm/v/@favorodera/use-promise.svg?style=plastic&label=NPM%20Version&color=blue" alt="NPM Version"></a>
<a href="https://npmx.dev/package/@favorodera/use-promise"><img src="https://img.shields.io/npm/dt/@favorodera/use-promise.svg?style=plastic&label=NPM%20Downloads&color=blue" alt="NPM Downloads"></a>
<a href="https://npmx.dev/package/@favorodera/use-promise"><img src="https://img.shields.io/npm/unpacked-size/@favorodera/use-promise?style=plastic&label=NPM%20Unpacked%20Size&color=blue" alt="NPM Unpacked Size"></a>
</p>
</div>

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

const { abort, execute, reset, state } = usePromise(async (signal, id: string) => {
  const response = await fetch(`/api/users/${id}`, { signal })
  return response.json()
})

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
type PromiseState<TData, TError extends Error = Error>
  = | { data: null, error: null, status: 'idle' }
    | { data: null | TData, error: null, status: 'pending' }
    | { data: null | TData, error: TError, status: 'error' }
    | { data: TData, error: null, status: 'success' }
```

`data` is preserved across `pending` and `error` states — no UI flicker on reload or failure.

---

## Behaviour

  **Auto-cancellation** — `execute()` aborts the previous request before starting a new one.

  **Race-condition safe** — only the latest execution updates state, even if an earlier one resolves last.

  **Signal-agnostic** — callbacks that don't honour `AbortSignal` are still protected via an internal execution ID.

  **Silent abort** — `abort()` and `reset()` never write to `state.error`.

---

## Examples

### 1. Fetching Data (with cancellation)

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { execute, state } = usePromise(async (signal, id: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    { signal }
  )
  return response.json()
})

execute('1')
</script>

<template>
  <div v-if="state.status === 'pending'">
    Loading...
  </div>

  <div v-else-if="state.status === 'error'">
    {{ state.error?.message }}
  </div>

  <pre v-else>{{ state.data }}</pre>
</template>
```

---

## 2. Simple Async Task (no cancellation needed)

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { execute, state } = usePromise(async (_signal, name: string) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })
  return `Hello, ${name}!`
})
</script>

<template>
  <button @click="execute('Alice')">
    Greet
  </button>

  <div v-if="state.status === 'pending'">
    Waiting...
  </div>

  <div v-else-if="state.status === 'success'">
    {{ state.data }}
  </div>
</template>
```
---

## 3. Search with Race Protection

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'
import { ref, watch } from 'vue'

const idToSearch = ref('')

const { execute, state } = usePromise(async (signal, id: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    { signal }
  )
  return response.json()
})

watch(idToSearch, (id) => {
  if (id) execute(id)
})
</script>

<template>
  <input
    v-model="idToSearch"
    placeholder="Enter user id to fetch"
  >

  <div v-if="state.status === 'pending'">
    Searching...
  </div>

  <div v-else-if="state.status === 'error'">
    {{ state.error }}
  </div>

  <pre v-else>{{ state.data }}</pre>
</template>
```

---

## 5. Parallel-like Trigger (latest wins)

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { execute, state } = usePromise(async (_signal, label: string) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 2000)
  })
  return `Finished: ${label}`
})
</script>

<template>
  <button @click="execute('A')">
    Run A
  </button>

  <button @click="execute('B')">
    Run B
  </button>

  <div v-if="state.status === 'pending'">
    Running...
  </div>

  <div v-else-if="state.status === 'error'">
    {{ state.error }}
  </div>

  <pre v-else>{{ state.data }}</pre>
</template>
```
