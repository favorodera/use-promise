/**
 * Creates a controllable promise for precise async timing.
 * @template TData The type of the resolved value.
 * @template TError The type of the rejected value.
 * @returns An object containing the promise, its resolve function, and its reject function.
 */
export function deferred<TData, TError = unknown>() {
  let resolve!: (value: TData) => void
  let reject!: (reason?: TError) => void

  const promise = new Promise<TData>((resolved, rejected) => {
    resolve = resolved
    reject = rejected
  })

  return { promise, reject, resolve }
}

/**
 * Helper function that always resolves.
 * @template TData The type of the resolved value.
 * @param value The value to resolve with.
 * @returns A function that takes an AbortSignal and returns a Promise that resolves with the given value.
 */
export function resolves<TData>(value: TData) {
  return (_signal: AbortSignal) => Promise.resolve(value)
}

/**
 * Helper function that always rejects.
 * @template TError The type of the rejected value.
 * @param error The error to reject with.
 * @returns A function that takes an AbortSignal and returns a Promise that rejects with the given error.
 */
export function rejects<TError = unknown>(error: TError) {
  return (_signal: AbortSignal) => Promise.reject(error)
}
