import { describe, it, expect, vi } from 'vitest'
import { usePromise } from '../src'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('usePromise', () => {
  it('resolves successfully', async () => {
    const { state, execute } = usePromise(async () => 'hello')

    await execute()

    expect(state.value.status).toBe('success')
    expect(state.value.data).toBe('hello')
  })

  it('handles errors', async () => {
    const { state, execute } = usePromise(async () => {
      throw new Error('fail')
    })

    await execute()

    expect(state.value.status).toBe('error')
    expect(state.value.error?.message).toBe('fail')
  })

  it('preserves data during reload', async () => {
    let count = 0

    const { state, execute } = usePromise(async () => {
      count++
      await delay(10)
      return count
    })

    await execute()
    const first = state.value.data

    execute() // don't await

    expect(state.value.data).toBe(first)
  })

  it('aborts previous request', async () => {
    const spy = vi.fn()

    const { execute } = usePromise(async (signal) => {
      await delay(20)
      if (!signal.aborted) spy()
    })

    execute()
    execute()

    await delay(50)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('prevents race conditions', async () => {
    const { state, execute } = usePromise(
      async (_, value: number) => {
        await delay(value === 1 ? 30 : 10)
        return value
      },
    )

    execute(1)
    await execute(2)

    expect(state.value.data).toBe(2)
  })

  it('abort prevents state update', async () => {
    const { state, execute, abort } = usePromise(async () => {
      await delay(20)
      return 'done'
    })

    execute()
    abort()

    await delay(30)

    expect(state.value.status).not.toBe('success')
  })
})
