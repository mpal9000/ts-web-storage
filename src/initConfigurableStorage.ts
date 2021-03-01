import { Obj, Either, Json } from '@mpal9000/ts-core'
import {
  StorageGetDataValueResult,
  StorageSetDataValueResult,
  StorageOptions,
  Storage,
} from './types.js'
import { ensureError } from './util.js'

export type StorageImplementation = Readonly<
  // eslint-disable-next-line no-restricted-globals
  Obj.Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>
>

type StorageGetDataResult<
  DecodedData extends Obj.UnknownObject
> = Either.Either<Error, Readonly<DecodedData>>

type StorageSetDataResult<
  DecodedData extends Obj.UnknownObject
> = Either.Either<Error, Readonly<DecodedData>>

export type ConfigurableStorageOptions<
  EncodedData extends Json.JsonifiedRecordInput = never,
  DecodedData extends Obj.UnknownObject = EncodedData
> = Obj.Omit<StorageOptions<EncodedData, DecodedData>, 'ephemeral'>

export const initConfigurableStorage = <
  EncodedData extends Json.JsonifiedRecordInput = never,
  DecodedData extends Obj.UnknownObject = EncodedData
>(
  options: ConfigurableStorageOptions<EncodedData, DecodedData>,
  storageImplementation: StorageImplementation,
): Storage<EncodedData, DecodedData> => {
  const { id, encodeData, decodeData, initialData } = options

  const defaultErrorMessage = 'Storage error'

  const readSerializedData = async (): Promise<string | undefined> => {
    const item = storageImplementation.getItem(id)

    return Promise.resolve(item === null ? undefined : item)
  }

  const writeDecodedData = async (
    data: Readonly<DecodedData>,
  ): Promise<void> => {
    storageImplementation.setItem(
      id,
      Json.stringify<EncodedData>(encodeData(data)),
    )

    return Promise.resolve()
  }

  const clearData = async (): Promise<void> => {
    storageImplementation.removeItem(id)

    return Promise.resolve()
  }

  const resetData = async (): Promise<Readonly<DecodedData>> => {
    await writeDecodedData(initialData)

    return Promise.resolve(initialData)
  }

  const getData = async (): Promise<StorageGetDataResult<DecodedData>> => {
    const serializedData = await readSerializedData()
    if (serializedData === undefined) {
      return Either.right(await resetData())
    }

    const jsonParseResult = Json.parse(serializedData)
    if (Either.isLeft(jsonParseResult)) {
      await resetData()
      return jsonParseResult
    }

    const decodeDataResult = decodeData(jsonParseResult.right)

    if (Either.isLeft(decodeDataResult)) {
      await resetData()
    }

    return decodeDataResult
  }

  const setData = async <DecodedDataKey extends keyof DecodedData>(
    key: DecodedDataKey,
    value: DecodedData[DecodedDataKey],
  ): Promise<StorageSetDataResult<DecodedData>> => {
    const getDataResult = await getData()

    if (Either.isRight(getDataResult)) {
      const decodedData = getDataResult.right
      await writeDecodedData({ ...decodedData, [key]: value })
    }

    return getDataResult
  }

  return {
    get: async <DecodedDataKey extends keyof DecodedData>(
      key: DecodedDataKey,
    ): Promise<StorageGetDataValueResult<DecodedData, DecodedDataKey>> => {
      try {
        return Either.map(Obj.prop(key), await getData())
      } catch (maybeError: unknown) {
        return Either.left(ensureError(defaultErrorMessage, maybeError))
      }
    },

    set: async <DecodedDataKey extends keyof DecodedData>(
      key: DecodedDataKey,
      value: DecodedData[DecodedDataKey],
    ): Promise<StorageSetDataValueResult<DecodedData, DecodedDataKey>> => {
      try {
        return Either.map(Obj.prop(key), await setData(key, value))
      } catch (maybeError: unknown) {
        return Either.left(ensureError(defaultErrorMessage, maybeError))
      }
    },

    clear: async (): Promise<void> => {
      await clearData()
    },
  }
}
