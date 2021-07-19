import { IAccountKey } from '..'
import AccountKeyFail from './accountKeyFail'
import AccountKeyLegacy from './accountKeyLegacy'
import AccountKeyPublic from './accountKeyPublic'
import WeightedMultiSigOptions, { WeightedMultiSigOptionsObject } from './weightedMultiSigOptions'
import WeightedPublicKey from './weightedPublicKey'

type NotRoleBasedAccountKey = 
  | AccountKeyLegacy
  | AccountKeyPublic
  | AccountKeyFail
  | AccountKeyWeightedMultiSig

export default class AccountKeyWeightedMultiSig implements IAccountKey {
  constructor(threshold: number, weightedPublicKeys: WeightedPublicKey[])

  static decode(rlpEncodedKey: string): AccountKeyWeightedMultiSig
  static fromPublicKeysAndOptions(publicKeyArray: string[], options?: WeightedMultiSigOptions | WeightedMultiSigOptionsObject): AccountKeyWeightedMultiSig
  getRLPEncoding(): string

  get threshold(): number
  set threshold(t)
  get weightedPublicKeys(): WeightedPublicKey[]
  set weightedPublicKeys(wps)
}