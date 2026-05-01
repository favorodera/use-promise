# usePromise

A lightweight Vue composable for managing async operations with:
- cancellation support
- race-condition safety
- stale data preservation

## Features

- Automatic request cancellation (AbortController)
- Race-condition safe (prevents stale updates)
- Keeps previous data during loading/errors
- Typed state (idle, pending, success, error)
- Minimal API

---

## Installation

```bash
npm install @favorodera/use-promise
```

---

## Usage

```ts
import { usePromise } from 'use-promise-vue'

const { state, execute, isPending } = usePromise(
  async (signal, id: string) => {
    const response = await fetch(`/api/users/${id}`, { signal })
    return response.json()
  }
)

execute('123')
```

---

## State

```ts
type PromiseState<TData, TError> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'pending'; data: TData | null; error: null }
  | { status: 'success'; data: TData; error: null }
  | { status: 'error'; data: TData | null; error: TError }
```

---

## API

### `usePromise(callback)`

### Parameters
- `callback(signal, ...args)`
Async function that receives an AbortSignal

---

## Returns

- `state`
Reactive state object

- `execute(...args)`
Executes the async function

- `abort()`
Cancels the current request

- `isIdle / isPending / isSuccess / isError`
Convenience computed flags

---

## Behaviour

### Auto-cancellation
Calling `execute()` cancels any in-flight request.

---

### Race-condition safe
Only the latest request updates state.

---

### Stale data preservation

Previous data is kept during:
- loading
- errors

No UI flicker.

---

## Examples

### Basic Usage
```vue
<script setup lang="ts">
import { usePromise } from './usePromise'

const { state, execute, isPending, isSuccess, isError } = usePromise(
  async (signal, id: string) => {
    const response = await fetch(`/api/users/${id}`, { signal })
    return response.json()
  }
)

execute('123')
</script>

<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="isError">Error!</div>
  <div v-else>{{ state.data }}</div>
</template>
```

