import { Transaction } from '../../caver-transaction/src'
import { Keyring } from './keyring/keyringFactory'
import MultipleKeyring from './keyring/multipleKeyring'
import RoleBasedKeyring from './keyring/roleBasedKeyring'
import SignatureData from './keyring/signatureData'
import SingleKeyring from './keyring/singleKeyring'

export interface SignMessageObject {
  message: string
  messageHash: string
  signatures: SignatureData[]
}

export default class KeyringContainer {
  constructor(keyrings?: Keyring[])

  generate(numberOfKeyrings: number, entropy?: string): string[]
  newKeyring(address: string, key: string): SingleKeyring
  newKeyring(address: string, key: string[]): MultipleKeyring
  newKeyring(address: string, key: string[][]): RoleBasedKeyring
  updateKeyring(keyring: Keyring): Keyring
  getKeyring(address: string): Keyring
  isExisted(address: string): Keyring
  add(keyring: Keyring): Keyring
  remove(address: string): boolean
  signMessage(address: string, data: string, role?: number, index?: number): SignMessageObject
  sign(address: string, transaction: Transaction, hasher?: Function): Promise<Transaction>
  sign(address: string, transaction: Transaction, index: number, hasher?: Function): Promise<Transaction>
  signAsFeePayer(address: string, transaction: Transaction, hasher?: Function): Promise<Transaction>
  signAsFeePayer(address: string, transaction: Transaction, index?: number): Promise<Transaction>
  signAsFeePayer(address: string, transaction: Transaction, index: number, hasher: Function): Promise<Transaction>

  get length(): number
}