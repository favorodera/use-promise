/** Creates a controllable promise for precise async timing. */
export function deferred<TData, TError = unknown>() {
  let resolve!: (value: TData) => void
  let reject!: (reason?: TError) => void

  const promise = new Promise<TData>((resolved, rejected) => {
    resolve = resolved
    reject = rejected
  })

  return { promise, resolve, reject }
}

/** Helper: always resolves */
export function resolves<TData>(value: TData) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_signal: AbortSignal) => Promise.resolve(value)
}

/** Helper: always rejects */
export function rejects<TError = unknown>(error: TError) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_signal: AbortSignal) => Promise.reject(error)
}
