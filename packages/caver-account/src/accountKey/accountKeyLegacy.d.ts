import { IAccountKey } from '..'

export default class AccountKeyLegacy implements IAccountKey {
  static decode(rlpEncodedKey: string): AccountKeyLegacy
  getRLPEncoding(): string
}