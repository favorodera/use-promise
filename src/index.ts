import { readonly, shallowRef } from 'vue'
import type { PromiseState } from './types'
import { toError } from './utils'

export type * from './types'

/**
 * A Vue composable for managing async operations with reactive state,
 * cancellation support, and race-condition safety.
 *
 * Designed for UI stability:
 * - Preserves previous data during reloads and errors
 * - Prevents stale responses from overwriting newer ones
 * - Supports request cancellation via AbortController
 * @template TData Resolved value type
 * @template TError Error type (must extend Error)
 * @template TArguments Argument tuple passed to the callback
 * @param callback Async function that receives an AbortSignal as its first argument
 * @returns The resolved value if successful, otherwise undefined.
 * @example
 * const { state, execute } = usePromise(
 *   async (signal, id: string) => fetch(`/api/users/${id}`, { signal }).then(response => response.json())
 * )
 *
 * execute('123')
 */
// eslint-disable-next-line ts/no-explicit-any
export function usePromise<TData = unknown, TError extends Error = Error, TArguments extends Array<any> = []>(callback: (signal: AbortSignal, ...args: TArguments) => Promise<TData>) {
  const state = shallowRef<PromiseState<TData, TError>>({
    data: undefined,
    error: undefined,
    status: 'idle',
  })

  let controller: AbortController | null | undefined
  let executionId = 0

  /**
   * Abort any in-flight execution.
   *
   * This is a silent cancellation:
   * - Does NOT set error state
   * - Keeps existing data intact
   */
  function abort(): void {
    controller?.abort()
    controller = undefined
  }

  /** Aborts any in-flight execution and resets the state to idle. */
  function reset(): void {
    abort()
    state.value = {
      data: undefined,
      error: undefined,
      status: 'idle',
    }
  }

  /**
   * Execute the async callback.
   *
   * Behavior:
   * - Aborts any previous request
   * - Sets state to `pending`
   * - Preserves previous data during loading
   * - Prevents stale responses from overwriting newer ones
   * @param args Arguments passed to the callback
   * @returns The resolved value if successful, otherwise undefined.
   * Errors are reflected in `state.error`.
   */
  async function execute(...args: TArguments): Promise<TData | undefined> {
    const currentId = ++executionId

    abort()

    controller = new AbortController()
    const { signal } = controller

    state.value = {
      data: state.value.data,
      error: undefined,
      status: 'pending',
    }

    try {
      // eslint-disable-next-line node/callback-return
      const data = await callback(signal, ...args)

      // Ignore stale or aborted responses
      if (signal.aborted || currentId !== executionId) return

      state.value = { data, error: undefined, status: 'success' }
      return data
    } catch (error) {
      if (signal.aborted || currentId !== executionId) return

      state.value = {
        data: state.value.data,
        error: toError<TError>(error),
        status: 'error',
      }
    } finally {
      if (currentId === executionId) {
        controller = undefined
      }
    }
  }

  return {
    /** Reactive promise state */
    state: readonly(state),

    /** Execute the async operation */
    execute,

    /** Abort any in-flight request */
    abort,

    /** Reset the promise state */
    reset,
  }
}
