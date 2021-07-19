import { IAccountKey } from '..'
import AccountKeyFail from './accountKeyFail'
import AccountKeyLegacy from './accountKeyLegacy'
import AccountKeyPublic from './accountKeyPublic'
import AccountKeyWeightedMultiSig from './accountKeyWeightedMultiSig'
import WeightedMultiSigOptions from './weightedMultiSigOptions'

type NotRoleBasedAccountKey = 
  | AccountKeyLegacy
  | AccountKeyPublic
  | AccountKeyFail
  | AccountKeyWeightedMultiSig

export default class AccountKeyRoleBased implements IAccountKey {
  constructor(accountKeyArray: NotRoleBasedAccountKey[])

  static decode(rlpEncodedKey: string): AccountKeyRoleBased
  static fromRoleBasedPublicKeysAndOptions(roleBasedPubArray: (AccountKeyLegacy[] | AccountKeyFail | string[])[], options?: WeightedMultiSigOptions[] | object): AccountKeyRoleBased
  getRLPEncoding(): string

  get accountKeys(): NotRoleBasedAccountKey[]
  set accountKeys(keys)
}