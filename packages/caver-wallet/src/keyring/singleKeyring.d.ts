import { EncryptOptions } from 'ethers/lib/utils'
import { SignMessageObject } from '..'
import Account from '../../../caver-account/src'
import { Keystore } from './keyringHelper'
import PrivateKey from './privateKey'

export default class SingleKeyring {
    constructor(address: string, key: string | PrivateKey)

    getPublicKey(compressed?: boolean): string
    copy(): SingleKeyring
    sign(transactionHash: string, chainId: string | number, role: number, index?: number): string[] | string[][]
    signMessage(message: string, role: number, index?: number): SignMessageObject
    getKeyByRole(role: number): PrivateKey[]
    getKlaytnWalletKey(): string
    toAccount(): Account
    encrypt(password: string, options?: EncryptOptions): Keystore
    encryptV3(password: string, options?: EncryptOptions): Keystore
    isDecoupled(): boolean

    get address(): string
    set address(addressInput)
    get key(): PrivateKey
    set key(keyInput)
}