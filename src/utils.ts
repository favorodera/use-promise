/**
 * Safely coerces an unknown thrown value to a typed Error instance.
 * @template TError The expected error type
 */
export function toError<TError extends Error>(error: unknown): TError {
  if (error instanceof Error) {
    return error as TError
  }

  return new Error(String(error)) as TError
}
