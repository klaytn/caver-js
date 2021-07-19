import { EncryptOptions } from 'ethers/lib/utils'
import { SignMessageObject } from '..'
import Account from '../../../caver-account/src'
import { WeightedMultiSigOptionsObject } from '../../../caver-account/src/accountKey/weightedMultiSigOptions'
import { Keystore } from './keyringHelper'
import PrivateKey from './privateKey'


export default class MultipleKeyring {
    constructor(address: string, keys: string[] | PrivateKey[])

    getPublicKey(compressed?: boolean): string[]
    copy(): MultipleKeyring
    sign(transactionHash: string, chainId: string | number, role: number, index?: number): string[] | string[][]
    signMessage(message: string, role: number, index?: number): SignMessageObject
    getKeyByRole(role: number): PrivateKey[]
    toAccount(options?: WeightedMultiSigOptionsObject): Account
    encrypt(password: string, options?: EncryptOptions): Keystore
    isDecoupled(): boolean

    get address(): string
    set address(addressInput)
    get keys(): PrivateKey[]
    set keys(keyInput)
}