import { Obj } from '@mpal9000/ts-core'

const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

const isUnknownRecord = (value: unknown): value is Obj.UnknownObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isErrorLike = (value: unknown): value is { readonly message: string } => {
  return isUnknownRecord(value) && 'message' in value && isString(value.message)
}

const isError = (value: unknown): value is Error => {
  return value instanceof Error
}

export const ensureError = (
  defaultErrorMessage: string,
  maybeError: unknown,
): Error => {
  if (isError(maybeError)) return maybeError
  if (isString(maybeError)) return new Error(maybeError)
  if (isErrorLike(maybeError)) return new Error(maybeError.message)
  return new Error(defaultErrorMessage)
}
