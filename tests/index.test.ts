import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePromise } from '../src'
import { deferred, rejects, resolves } from './test-utils'

describe('init', () => {
  it('starts in idle state', () => {
    const { state } = usePromise(resolves('x'))

    expect(state.value).toStrictEqual({
      data: undefined,
      error: undefined,
      status: 'idle',
    })
  })
})

describe('success path', () => {
  it('transitions: idle => pending => success', async () => {
    const { execute, state } = usePromise(resolves('hello'))

    const promise = execute()

    // Immediately pending
    expect(state.value.status).toBe('pending')

    await promise

    expect(state.value).toStrictEqual({
      data: 'hello',
      error: undefined,
      status: 'success',
    })
  })

  it('returns resolved value from execute()', async () => {
    const { execute } = usePromise(resolves(42))
    const result = await execute()

    expect(result).toBe(42)
  })

  it('passes arguments to callback', async () => {
    const callback = vi.fn((_signal: AbortSignal, a: number, b: number) => Promise.resolve(a + b))

    const { execute } = usePromise(callback)

    await execute(2, 3)

    expect(callback).toHaveBeenCalledWith(expect.any(AbortSignal), 2, 3)
  })
})

describe('error path', () => {
  it('sets error state on rejection', async () => {
    const error = new Error('boom')
    const { execute, state } = usePromise(rejects(error))

    await execute()

    expect(state.value).toStrictEqual({
      data: undefined,
      error,
      status: 'error',
    })
  })

  it('coerces non-Error values into Error', async () => {
    const { execute, state } = usePromise(rejects('string error'))

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

    const { execute, state } = usePromise((_signal: AbortSignal) => (shouldFail
      ? Promise.reject(new Error('fail'))
      : slow.promise))

    await execute()

    expect(state.value.status).toBe('error')

    shouldFail = false

    execute()
    await nextTick()

    // NOW we can observe pending
    expect(state.value.status).toBe('pending')
    expect(state.value.error).toBeNullable()

    slow.resolve('ok')
    await nextTick()

    expect(state.value.status).toBe('success')
  })
})

describe('data preservation', () => {
  it('preserves data during pending state (no UI flicker)', async () => {
    let isFirstCall = true
    const slow = deferred<string>()

    const { execute, state } = usePromise((_signal: AbortSignal) => {
      if (isFirstCall) {
        isFirstCall = false
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
    expect(state.value.data).toBe('cached')
  })

  it('preserves last successful data on error', async () => {
    let shouldFail = false

    const { execute, state } = usePromise((_signal: AbortSignal) => (shouldFail
      ? Promise.reject(new Error('fail'))
      : Promise.resolve('good')))

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
    const { abort, execute, state } = usePromise(() => pending.promise)

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
    const { abort, execute, state } = usePromise(() => pending.promise)

    execute()
    abort()

    pending.resolve('ignored')
    await nextTick()

    expect(state.value.error).toBeNullable()
  })

  it('preserves existing data on abort', async () => {
    let isFirst = true
    const pending = deferred<string>()

    const { abort, execute, state } = usePromise((_signal: AbortSignal) => {
      if (isFirst) {
        isFirst = false
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
    let isFirst = true

    const { execute } = usePromise((_signal: AbortSignal) => {
      if (isFirst) {
        isFirst = false
        return new Promise(() => {
          // never resolves
        })
      }
      return Promise.resolve('done')
    })

    // stuck
    execute()

    const result = await execute()

    expect(result).toBe('done')
  })
})

describe('reset', () => {
  it('reset returns state to idle', async () => {
    const { execute, reset, state } = usePromise(resolves('data'))

    await execute()

    expect(state.value.status).toBe('success')

    reset()

    expect(state.value).toStrictEqual({
      data: undefined,
      error: undefined,
      status: 'idle',
    })
  })

  it('reset aborts in-flight request', async () => {
    const pending = deferred<string>()
    const { execute, reset, state } = usePromise(() => pending.promise)

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

    const { execute, state } = usePromise(() => {
      callCount++
      return callCount === 1 ? first.promise : second.promise
    })

    // slow
    execute()

    // fast
    execute()

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

    const { execute, state } = usePromise(() => {
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
