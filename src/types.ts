import { Obj, Either, Json } from '@mpal9000/ts-core'

type StorageEncodedData<
  EncodedData extends Json.JsonifiedRecordInput
> = Json.Jsonified<EncodedData>

export type StorageGetDataValueResult<
  DecodedData extends Obj.UnknownObject = never,
  DecodedDataKey extends keyof DecodedData = never
> = Either.Either<Error, Readonly<DecodedData[DecodedDataKey]>>

export type StorageSetDataValueResult<
  DecodedData extends Obj.UnknownObject = never,
  DecodedDataKey extends keyof DecodedData = never
> = Either.Either<Error, Readonly<DecodedData[DecodedDataKey]>>

export type StorageDataEncoderResult<
  EncodedData extends Json.JsonifiedRecordInput = never
> = StorageEncodedData<EncodedData>

export type StorageDataEncoder<
  EncodedData extends Json.JsonifiedRecordInput = never,
  DecodedData extends Obj.UnknownObject = EncodedData
> = (value: Readonly<DecodedData>) => StorageDataEncoderResult<EncodedData>

export type StorageDataDecoderResult<
  DecodedData extends Obj.UnknownObject = never
> = Either.Either<Error, Readonly<DecodedData>>

export type StorageDataDecoder<
  DecodedData extends Obj.UnknownObject = never
> = (value: Json.Json) => StorageDataDecoderResult<DecodedData>

export type StorageOptions<
  EncodedData extends Json.JsonifiedRecordInput = never,
  DecodedData extends Obj.UnknownObject = EncodedData
> = {
  readonly id: string
  readonly encodeData: StorageDataEncoder<EncodedData, DecodedData>
  readonly decodeData: StorageDataDecoder<DecodedData>
  readonly initialData: Readonly<DecodedData>
  readonly ephemeral?: boolean
}

export type Storage<
  EncodedData extends Json.JsonifiedRecordInput = never,
  DecodedData extends Obj.UnknownObject = EncodedData
> = {
  readonly get: <DecodedDataKey extends keyof DecodedData>(
    key: DecodedDataKey,
  ) => Promise<StorageGetDataValueResult<DecodedData, DecodedDataKey>>

  readonly set: <DecodedDataKey extends keyof DecodedData>(
    key: DecodedDataKey,
    value: DecodedData[DecodedDataKey],
  ) => Promise<StorageSetDataValueResult<DecodedData, DecodedDataKey>>

  readonly clear: () => Promise<void>
}
