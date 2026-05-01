/**
 * The state of the promise.
 * @template TReturn The type of the return value.
 * @template TError The type of the error.
 */
export type PromiseState<TReturn, TError extends Error = Error>
  = | { status: 'idle', data: null, error: null }
    | { status: 'pending', data: TReturn | null, error: null }
    | { status: 'success', data: TReturn, error: null }
    | { status: 'error', data: TReturn | null, error: TError }
