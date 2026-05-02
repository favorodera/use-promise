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
 *
 * @template TData Resolved value type
 * @template TError Error type (must extend Error)
 * @template TArguments Argument tuple passed to the callback
 *
 * @param callback Async function that receives an AbortSignal as its first argument
 *
 * @example
 * const { state, execute } = usePromise(
 *   async (signal, id: string) => fetch(`/api/users/${id}`, { signal }).then(response => response.json())
 * )
 *
 * execute('123')
 */
export function usePromise<
  TData = unknown,
  TError extends Error = Error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArguments extends any[] = [],
>(
  callback: (signal: AbortSignal, ...args: TArguments) => Promise<TData>,
) {
  const state = shallowRef<PromiseState<TData, TError>>({
    status: 'idle',
    data: null,
    error: null,
  })

  let controller: AbortController | null = null
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
    controller = null
  }

  function reset(): void {
    abort()
    state.value = {
      status: 'idle',
      data: null,
      error: null,
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
   *
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
      status: 'pending',
      data: state.value.data,
      error: null,
    }

    try {
      const data = await callback(signal, ...args)

      // Ignore stale or aborted responses
      if (signal.aborted || currentId !== executionId) return

      state.value = { status: 'success', data, error: null }
      return data
    } catch (error) {
      if (signal.aborted || currentId !== executionId) return

      state.value = {
        status: 'error',
        data: state.value.data,
        error: toError<TError>(error),
      }
    } finally {
      if (currentId === executionId) {
        controller = null
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
