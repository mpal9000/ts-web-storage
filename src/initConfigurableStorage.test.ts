import test from 'ava'
import { Either, Func, Json } from '@mpal9000/ts-core'
import { wrapIs, isType } from './test.js'
import {
  StorageImplementation,
  initConfigurableStorage,
} from './initConfigurableStorage.js'

const undef = Func.always(undefined)

const createMockedStorageImplementation = (): StorageImplementation => {
  const cache: { [Key in string]: string } = {}

  const storageImplementation: StorageImplementation = {
    getItem: (key: string): string | null => {
      return cache[key] ?? null
    },
    setItem: (key: string, value: string): void => {
      cache[key] = value
    },
    removeItem: (key: string): void => {
      delete cache[key]
    },
  }

  return storageImplementation
}

test('initConfigurableStorage()', async (t) => {
  const is: ReturnType<typeof wrapIs> = wrapIs(t)

  const initialDataSymbol = Symbol.for('x')
  const initialData = {
    a: '',
    b: false,
    c: initialDataSymbol,
  } as const

  const storage1 = initConfigurableStorage<
    { a: string; b: boolean; c: string },
    { a: string; b: boolean; c: symbol }
  >(
    {
      id: 'xyz',
      encodeData: (decodedData) => {
        return {
          ...decodedData,
          c: Symbol.keyFor(decodedData.c) ?? '',
          // c: true, // error
        }
      },
      decodeData: (encodedData) => {
        return Either.right(
          Json.isRecord(encodedData)
            ? {
                a:
                  typeof encodedData.a === 'string'
                    ? encodedData.a
                    : initialData.a,
                b:
                  typeof encodedData.b === 'boolean'
                    ? encodedData.b
                    : initialData.b,
                c:
                  typeof encodedData.c === 'string'
                    ? Symbol.for(encodedData.c)
                    : initialData.c,
              }
            : initialData,
        )
      },
      initialData,
    },
    createMockedStorageImplementation(),
  )

  is(
    initialData.a,
    isType<string | undefined>()(
      Either.getOrElse(undef, await storage1.get('a')),
    ),
  )
  is(
    initialData.b,
    isType<boolean | undefined>()(
      Either.getOrElse(undef, await storage1.get('b')),
    ),
  )
  is(
    initialData.c,
    isType<symbol | undefined>()(
      Either.getOrElse(undef, await storage1.get('c')),
    ),
  )

  const nextDataSymbol = Symbol.for('y')
  const nextData = {
    a: 'x',
    b: true,
    c: nextDataSymbol,
  } as const

  is(
    initialData.a,
    isType<string | undefined>()(
      Either.getOrElse(undef, await storage1.set('a', nextData.a)),
    ),
  )
  is(
    initialData.b,
    isType<boolean | undefined>()(
      Either.getOrElse(undef, await storage1.set('b', nextData.b)),
    ),
  )
  is(
    initialData.c,
    isType<symbol | undefined>()(
      Either.getOrElse(undef, await storage1.set('c', nextData.c)),
    ),
  )

  is(
    nextData.a,
    isType<string | undefined>()(
      Either.getOrElse(undef, await storage1.get('a')),
    ),
  )
  is(
    nextData.b,
    isType<boolean | undefined>()(
      Either.getOrElse(undef, await storage1.get('b')),
    ),
  )
  is(
    nextData.c,
    isType<symbol | undefined>()(
      Either.getOrElse(undef, await storage1.get('c')),
    ),
  )

  await storage1.clear()

  is(
    initialData.a,
    isType<string | undefined>()(
      Either.getOrElse(undef, await storage1.get('a')),
    ),
  )
  is(
    initialData.b,
    isType<boolean | undefined>()(
      Either.getOrElse(undef, await storage1.get('b')),
    ),
  )
  is(
    initialData.c,
    isType<symbol | undefined>()(
      Either.getOrElse(undef, await storage1.get('c')),
    ),
  )
})
