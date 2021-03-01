import {
  ExecutionContext,
  IsAssertion,
  TrueAssertion,
  FalseAssertion,
} from 'ava'
import { Util, Float, Integer } from '@mpal9000/ts-core'

interface ExpectedType<Type> {
  readonly tag: unique symbol
  readonly type: Type
}

export function isType<Expected = never>() {
  return <Actual>(
    actual: Util.IsEqual<Actual, Expected> extends true
      ? Actual
      : ExpectedType<Expected>,
  ): Actual => {
    // type-coverage:ignore-next-line
    return actual as Actual
  }
}

export function isTypeAssignable<Expected = never>() {
  return <Actual>(
    actual: Util.IsAssignable<Expected, Actual> extends true
      ? Actual
      : ExpectedType<Expected>,
  ): Actual => {
    // type-coverage:ignore-next-line
    return actual as Actual
  }
}

export const wrapIs = <Context = unknown>(t: ExecutionContext<Context>) => {
  return function is<Expected extends Util.Mixed, Actual extends Util.Mixed>(
    expected: Expected,
    actual: Util.Mixed extends Actual
      ? unknown
      : Expected extends Actual
      ? Actual
      : ExpectedType<Expected>,
  ): asserts actual is Expected extends Actual ? Expected : never {
    return t.is.call<
      ExecutionContext<Context>,
      [unknown, unknown] | [unknown, unknown, string | undefined],
      ReturnType<IsAssertion>
    >(t, actual, expected)
  }
}

export const wrapDeepEqual = <Context = unknown>(
  t: ExecutionContext<Context>,
) => {
  return function is<Expected extends Util.Mixed, Actual extends Util.Mixed>(
    expected: Expected,
    actual: Util.Mixed extends Actual
      ? unknown
      : Expected extends Actual
      ? Actual
      : ExpectedType<Expected>,
  ): asserts actual is Expected extends Actual ? Expected : never {
    return t.deepEqual.call<
      ExecutionContext<Context>,
      [unknown, unknown] | [unknown, unknown, string | undefined],
      ReturnType<IsAssertion>
    >(t, actual, expected)
  }
}

export const wrapTrue = <Context = unknown>(t: ExecutionContext<Context>) => {
  return function isTrue<Actual extends Util.Mixed>(
    actual: Util.Mixed extends Actual
      ? unknown
      : true extends Actual
      ? Actual
      : true,
  ): asserts actual is true extends Actual ? true : never {
    return t.true.call<
      ExecutionContext<Context>,
      [unknown] | [unknown, string | undefined],
      ReturnType<TrueAssertion>
    >(t, actual)
  }
}

export const wrapFalse = <Context = unknown>(t: ExecutionContext<Context>) => {
  return function isFalse<Actual extends Util.Mixed>(
    actual: Util.Mixed extends Actual
      ? unknown
      : false extends Actual
      ? Actual
      : false,
  ): asserts actual is false extends Actual ? false : never {
    return t.false.call<
      ExecutionContext<Context>,
      [unknown] | [unknown, string | undefined],
      ReturnType<FalseAssertion>
    >(t, actual)
  }
}

export function apply<Value extends Util.Mixed, Result>(
  fn: (value: Value) => Result,
  value: Value,
): Result
export function apply<Value, Result>(
  fn: (value: Value) => Result,
  value: Value,
): Result
export function apply<Value, Result>(
  fn: (value: Value) => Result,
  value: Value,
): Result {
  return fn(value)
}

export const unknown = (): unknown => ({} as unknown)

export const mixed = (): Util.Mixed => ({} as Util.Mixed)

// type-coverage:ignore-next-line
export const f = (): Float.Float => 1.1 as Float.Float
// type-coverage:ignore-next-line
export const i = (): Integer.Integer => 1 as Integer.Integer
