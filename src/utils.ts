/** Safely coerces an unknown thrown value to a typed Error instance. */
export function toError<TError extends Error>(error: unknown) {
  if (error instanceof Error) return error as TError
  return new Error(String(error)) as TError
}
