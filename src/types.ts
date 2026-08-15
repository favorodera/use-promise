/**
 * The state of the promise.
 * @template TData The type of the return value.
 * @template TError The type of the error.
 */
export type PromiseState<TData, TError extends Error = Error>
  = |
    {
      data: null | TData | undefined
      error: null | undefined
      status: 'pending'
    }
    | {
      data: null | TData | undefined
      error: TError
      status: 'error'
    }
    | {
      data: null | undefined
      error: null | undefined
      status: 'idle'
    }
    | {
      data: TData
      error: null | undefined
      status: 'success'
    }
