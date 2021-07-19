import MultipleKeyring from './multipleKeyring'
import PrivateKey from './privateKey'
import RoleBasedKeyring from './roleBasedKeyring'
import SignatureData from './signatureData'
import SingleKeyring from './singleKeyring'
import { KEY_ROLE } from './keyringHelper'

export type Keyring =
    | SingleKeyring
    | MultipleKeyring
    | RoleBasedKeyring

export default class KeyringFactory {
    static privateKey: PrivateKey
    static singleKeyring: SingleKeyring
    static multipleKeyring: MultipleKeyring
    static roleBasedKeyring: RoleBasedKeyring
    static role: typeof KEY_ROLE
    static signatureData: SignatureData

    static generate(entropy?: string): SingleKeyring
    static generateSingleKey(entropy?: string): string
    static generateMultipleKeys(num: number, entropy?: string): string[]
    static generateRoleBasedKeys(numArr: number[], entropy?: string): string[][]
    static create(address: string, key: string): SingleKeyring
    static create(address: string, key: string[]): MultipleKeyring
    static create(address: string, key: string[][]): RoleBasedKeyring
    static createFromPrivateKey(privateKey: string): SingleKeyring
    static createFromKlaytnWalletKey(klaytnWalletKey: string): SingleKeyring
    static createWithSingleKey(address: string, key: string): SingleKeyring
    static createWithMultipleKey(address: string, keyArray: string[]): MultipleKeyring
    static createWithRoleBasedKey(address: string, roledBasedKeyArray: string[][]): RoleBasedKeyring
    static decrypt(keystore: object, password: string): Keyring
}