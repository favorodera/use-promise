# usePromise

---

  [![npm version](https://img.shields.io/npm/v/@favorodera/use-promise.svg?style=flat-square)](https://www.npmjs.com/package/@favorodera/use-promise)
  [![npm downloads](https://img.shields.io/npm/dm/@favorodera/use-promise.svg?style=flat-square)](https://www.npmjs.com/package/@favorodera/use-promise)
  [![license](https://img.shields.io/github/license/favorodera/use-promise.svg?style=flat-square)](https://github.com/favorodera/use-promise/blob/main/LICENSE)
  [![Bundle Size](https://img.shields.io/bundlephobia/minzip/@favorodera/use-promise.svg?style=flat-square)](https://bundlephobia.com/package/@favorodera/use-promise)

---

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

## Examples

### 1. Fetching Data (with cancellation)

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { state, execute } = usePromise(
  async (signal, id: string) => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`,
      { signal }
    )
    return response.json()
  }
)

execute('1')
</script>

<template>
  <div v-if="state.status === 'pending'">Loading...</div>
  <div v-else-if="state.status === 'error'">{{ state.error?.message }}</div>
  <pre v-else>{{ state.data }}</pre>
</template>
```

---

## 2. Simple Async Task (no cancellation needed)

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { state, execute } = usePromise(
  async (_signal, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `Hello, ${name}!`
  }
)
</script>

<template>
  <button @click="execute('Alice')">Greet</button>

  <div v-if="state.status === 'pending'">Waiting...</div>
  <div v-else-if="state.status === 'success'">{{ state.data }}</div>
</template>
```
---

## 3. Search with Race Protection

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePromise } from '@favorodera/use-promise'

const idToSearch = ref('')

const { state, execute } = usePromise(
  async (signal, id: string) => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`,
      { signal }
    )
    return response.json()
  }
)

watch(idToSearch, (id) => {
  if (id) execute(id)
})
</script>

<template>
  <input v-model="idToSearch" placeholder="Enter user id to fetch" />

  <div v-if="state.status === 'pending'">Searching...</div>
  <div v-else-if="state.status === 'error'">{{ state.error }}</div>
  <pre v-else>{{ state.data }}</pre>
</template>
```

---

## 5. Parallel-like Trigger (latest wins)

```vue
<script setup lang="ts">
import { usePromise } from '@favorodera/use-promise'

const { state, execute } = usePromise(
  async (_signal, label: string) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000))
    return `Finished: ${label}`
  }
)
</script>

<template>
  <button @click="execute('A')">Run A</button>
  <button @click="execute('B')">Run B</button>

  <div v-if="state.status === 'pending'">Running...</div>
  <div v-else-if="state.status === 'error'">{{ state.error }}</div>
  <pre v-else>{{ state.data }}</pre>
</template>
```
