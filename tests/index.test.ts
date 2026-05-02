/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePromise } from '../src'
import { deferred, rejects, resolves } from './test-utils'


describe('init', () => {
  it('starts in idle state', () => {
    const { state } = usePromise(resolves('x'))

    expect(state.value).toEqual({
      status: 'idle',
      data: null,
      error: null,
    })
  })
})

describe('success path', () => {
  it('transitions: idle => pending => success', async () => {
    const { state, execute } = usePromise(resolves('hello'))

    const promise = execute()

    // Immediately pending
    expect(state.value.status).toBe('pending')

    await promise

    expect(state.value).toEqual({
      status: 'success',
      data: 'hello',
      error: null,
    })
  })

  it('returns resolved value from execute()', async () => {
    const { execute } = usePromise(resolves(42))
    const result = await execute()

    expect(result).toBe(42)
  })

  it('passes arguments to callback', async () => {
    const callback = vi.fn((_signal: AbortSignal, a: number, b: number) =>
      Promise.resolve(a + b),
    )

    const { execute } = usePromise(callback)

    await execute(2, 3)

    expect(callback).toHaveBeenCalledWith(expect.any(AbortSignal), 2, 3)
  })
})

describe('error path', () => {
  it('sets error state on rejection', async () => {
    const error = new Error('boom')
    const { state, execute } = usePromise(rejects(error))

    await execute()

    expect(state.value).toEqual({
      status: 'error',
      data: null,
      error,
    })
  })

  it('coerces non-Error values into Error', async () => {
    const { state, execute } = usePromise(rejects('string error'))

    await execute()

    expect(state.value.error).toBeInstanceOf(Error)
    expect(state.value.error?.message).toBe('string error')
  })

  it('returns undefined on failure', async () => {
    const { execute } = usePromise(rejects(new Error('fail')))
    const result = await execute()

    expect(result).toBeUndefined()
  })

  it('clears previous error when re-executing', async () => {
    const slow = deferred<string>()
    let shouldFail = true

    const { state, execute } = usePromise((_signal: AbortSignal) =>
      shouldFail
        ? Promise.reject(new Error('fail'))
        : slow.promise,
    )

    await execute()
    expect(state.value.status).toBe('error')

    shouldFail = false

    execute()
    await nextTick()

    // NOW we can observe pending
    expect(state.value.status).toBe('pending')
    expect(state.value.error).toBeNull()

    slow.resolve('ok')
    await nextTick()

    expect(state.value.status).toBe('success')
  })
})

describe('data preservation', () => {
  it('preserves data during pending state (no UI flicker)', async () => {
    let firstCall = true
    const slow = deferred<string>()

    const { state, execute } = usePromise((_signal: AbortSignal) => {
      if (firstCall) {
        firstCall = false
        return Promise.resolve('cached')
      }
      return slow.promise
    })

    await execute()
    expect(state.value.data).toBe('cached')

    // Trigger second call => pending
    execute()
    await nextTick()

    expect(state.value.status).toBe('pending')
    expect(state.value.data).toBe('cached') // still there
  })

  it('preserves last successful data on error', async () => {
    let shouldFail = false

    const { state, execute } = usePromise((_signal: AbortSignal) =>
      shouldFail
        ? Promise.reject(new Error('fail'))
        : Promise.resolve('good'),
    )

    await execute()
    expect(state.value.data).toBe('good')

    shouldFail = true
    await execute()

    expect(state.value.status).toBe('error')
    expect(state.value.data).toBe('good')
  })
})

describe('abort behaviour', () => {
  it('does not update state after abort', async () => {
    const pending = deferred<string>()
    const { state, execute, abort } = usePromise(() => pending.promise)

    execute()
    await nextTick()

    abort()

    // Resolve AFTER abort => should be ignored
    pending.resolve('late')
    await nextTick()

    expect(state.value.status).toBe('pending')
  })

  it('abort is silent (no error state)', async () => {
    const pending = deferred<string>()
    const { state, execute, abort } = usePromise(() => pending.promise)

    execute()
    abort()

    pending.resolve('ignored')
    await nextTick()

    expect(state.value.error).toBeNull()
  })

  it('preserves existing data on abort', async () => {
    let first = true
    const pending = deferred<string>()

    const { state, execute, abort } = usePromise((_signal: AbortSignal) => {
      if (first) {
        first = false
        return Promise.resolve('kept')
      }
      return pending.promise
    })

    await execute()
    expect(state.value.data).toBe('kept')

    execute()
    abort()

    pending.resolve('ignored')
    await nextTick()

    expect(state.value.data).toBe('kept')
  })

  it('can re-execute after abort', async () => {
    let first = true

    const { execute } = usePromise((_signal: AbortSignal) => {
      if (first) {
        first = false
        return new Promise(() => {}) // never resolves
      }
      return Promise.resolve('done')
    })

    execute() // stuck

    const result = await execute()
    expect(result).toBe('done')
  })
})

describe('reset', () => {
  it('reset returns state to idle', async () => {
    const { state, execute, reset } = usePromise(resolves('data'))

    await execute()
    expect(state.value.status).toBe('success')

    reset()

    expect(state.value).toEqual({
      status: 'idle',
      data: null,
      error: null,
    })
  })

  it('reset aborts in-flight request', async () => {
    const pending = deferred<string>()
    const { state, execute, reset } = usePromise(() => pending.promise)

    execute()
    await nextTick()

    reset()

    pending.resolve('ignored')
    await nextTick()

    expect(state.value.status).toBe('idle')
  })
})

describe('race conditions', () => {
  it('latest execution wins (prevents stale overwrite)', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    let callCount = 0

    const { state, execute } = usePromise(() => {
      callCount++
      return callCount === 1 ? first.promise : second.promise
    })

    execute() // slow
    execute() // fast

    second.resolve('fresh')
    await nextTick()

    first.resolve('stale')
    await nextTick()

    expect(state.value.data).toBe('fresh')
  })

  it('guards against callbacks that ignore AbortSignal', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    let callCount = 0

    const { state, execute } = usePromise(() => {
      callCount++
      return callCount === 1 ? first.promise : second.promise
    })

    execute()
    execute()

    second.resolve('correct')
    await nextTick()

    // Even though this resolves later, it must be ignored
    first.resolve('stale')
    await nextTick()

    expect(state.value.data).toBe('correct')
  })
})

