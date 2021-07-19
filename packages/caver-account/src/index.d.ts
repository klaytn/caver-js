import AccountKeyDecoder from './accountKey/accountKeyDecoder'
import AccountKeyFail from './accountKey/accountKeyFail'
import AccountKeyLegacy from './accountKey/accountKeyLegacy'
import AccountKeyPublic from './accountKey/accountKeyPublic'
import AccountKeyRoleBased from './accountKey/accountKeyRoleBased'
import AccountKeyWeightedMultiSig from './accountKey/accountKeyWeightedMultiSig'
import WeightedMultiSigOptions from './accountKey/weightedMultiSigOptions'
import WeightedPublicKey from './accountKey/weightedPublicKey'

type AccountKey = 
  | AccountKeyLegacy
  | AccountKeyPublic
  | AccountKeyFail
  | AccountKeyWeightedMultiSig
  | AccountKeyRoleBased

export interface IAccountKey {
  getRLPEncoding(): string
}

export default class Account {
  constructor(address: string, accountKey: AccountKey)

  static create(address: string, accountKey: string | string[] | string[][], options?: WeightedMultiSigOptions | WeightedMultiSigOptions[]): Account
  static createFromRLPEncoding(address: string, rlpEncodedKey: string): Account
  static createWithAccountKeyLegacy(address: string): Account
  static createWithAccountKeyPublic(address: string, publicKey: string): Account
  static createWithAccountKeyFail(address: string): Account
  static createWithAccountKeyWeightedMultiSig(address: string, publicKeyArray: string[], options?: WeightedMultiSigOptions): Account
  static createWithAccountKeyRoleBased(address: string, roledBasedPublicKeyArray: string[][], options?: WeightedMultiSigOptions[]): Account
  getRLPEncodingAccountKey(): string

  get address(): string
  set address(addressInput)
  get accountKey(): AccountKey
  set accountKey(accountKey)

  static weightedMultiSigOptions: typeof WeightedMultiSigOptions
  static accountKey: {
    decode: typeof AccountKeyDecoder['decode']
    accountKeyLegacy: typeof AccountKeyLegacy
    accountKeyPublic: typeof AccountKeyPublic
    accountKeyFail: typeof AccountKeyFail
    accountKeyWeightedMultiSig: typeof AccountKeyWeightedMultiSig
    accountKeyRoleBased: typeof AccountKeyRoleBased
    weightedPublicKey: WeightedPublicKey
  }
}