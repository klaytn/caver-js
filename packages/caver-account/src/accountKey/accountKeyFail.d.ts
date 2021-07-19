import { IAccountKey } from '..'

export default class AccountKeyFail implements IAccountKey {
  static decode(rlpEncodedKey: string): AccountKeyFail
  getRLPEncoding(): string
}