/**
 * The state of the promise.
 * @template TData The type of the return value.
 * @template TError The type of the error.
 */
export type PromiseState<TData, TError extends Error = Error>
  = | { status: 'idle', data: null, error: null }
    | { status: 'pending', data: TData | null, error: null }
    | { status: 'success', data: TData, error: null }
    | { status: 'error', data: TData | null, error: TError }

