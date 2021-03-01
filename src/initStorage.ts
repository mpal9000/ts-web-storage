import { Obj, Json } from '@mpal9000/ts-core'
import { StorageOptions, Storage } from './types.js'
import { globalThis } from './globalThis.js'
import { initConfigurableStorage } from './initConfigurableStorage.js'

export const initStorage = <
  EncodedData extends Json.JsonifiedRecordInput = never,
  DecodedData extends Obj.UnknownObject = EncodedData
>(
  options: StorageOptions<EncodedData, DecodedData>,
): Storage<EncodedData, DecodedData> => {
  const { ephemeral = false, ...restOptions } = options

  return initConfigurableStorage<EncodedData, DecodedData>(
    restOptions,
    ephemeral ? globalThis.sessionStorage : globalThis.localStorage,
  )
}
