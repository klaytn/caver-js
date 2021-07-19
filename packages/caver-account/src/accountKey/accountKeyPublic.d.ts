import { IAccountKey } from '..'

export default class AccountKeyPublic implements IAccountKey {
  constructor(publicKey: string)

  static decode(rlpEncodedKey: string): AccountKeyPublic
  static fromXYPoint(x: string, y: string): AccountKeyPublic
  static fromPublicKey(pubKey: string): AccountKeyPublic
  getRLPEncoding(): string
  getXYPoint(): string[]

  get publicKey(): string
  set publicKey(p)
}