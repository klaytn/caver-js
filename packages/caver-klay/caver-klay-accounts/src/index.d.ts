/*
    Copyright 2021 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

import RpcCallToMethod from '../../../caver-rtm/src'
import { SignatureObject } from '../../../caver-utils/src/utils'
import { EncryptedKeyOptions, Keystore } from '../../../caver-wallet/src/keyring/keyringHelper'
import Account, { AccountKey } from './account/account'
import AccountForUpdate from './account/accountForUpdate'
import AccountKeyMultiSig from './accountKey/accountKeyMultiSig'
import AccountKeyPublic from './accountKey/accountKeyPublic'
import AccountKeyRoleBased, { RoleBasedKeyObject } from './accountKey/accountKeyRoleBased'

export interface TransactionObject {
    feePayerSignatures?: string[][]
    message?: string
    messageHash: string
    r: string
    rawTransaction: string
    s: string
    senderTxHash: string
    signatures?: string[]
    signature?: string
    txHash: string
    v: string
}

export interface PublicKeyObject {
    feePayerKey?: string | string[]
    transactionKey?: string
    updateKey?: string | string[]
}

export interface UpdateOptionsObject {
    threshold?: number
    weight?: number[]
    updateKey?: UpdateOptionsObject
    transactionKey?: UpdateOptionsObject
}

export class AccountWithFunctions extends Account {
    signTransaction(tx: string | object, callback?: Function): Promise<TransactionObject>
    feePayerSignTransaction(tx: string | object, callback?: Function): Promise<TransactionObject>
    sign(data: string): TransactionObject
    encrypt(password: string, options?: EncryptedKeyOptions): Keystore
    getKlaytnWalletKey(addressOrIndex?: string | number): string
}

export class AccountInWallet extends AccountWithFunctions {
    index: number
}

export class Wallet {
    constructor(accounts: Accounts)

    length: 0
    defaultKeyName: 'caverjs_wallet'

    create(numberOfAccounts: number, entropy?: string): Wallet
    add(account: string | Account | AccountKey | object, userInputAddrees?: string): AccountInWallet
    updatePrivateKey(privateKey: string, address: string): AccountInWallet
    updateAccountKey(address: string, accountKey: string | string[] | PublicKeyObject | AccountKey): AccountInWallet
    remove(addressOrIndex: string | number): boolean
    clear(): Wallet
    encrypt(password: string, options?: EncryptedKeyOptions): Keystore[]
    decrypt(encryptedWallet: Keystore[], password: string): Wallet
    save(password: string, keyName: string): boolean
    load(password: string, keyName: string): Wallet
    getKlaytnWalletKey(addressOrIndex: string | number): string
    getAccount(input: string | number): AccountInWallet
}

export default class Accounts {
    constructor(...args: any[])

    wallet: Wallet

    getChainId: RpcCallToMethod['klay_chainID']
    getGasPrice: RpcCallToMethod['klay_gasPrice']
    getTransactionCount: RpcCallToMethod['klay_getTransactionCount']
    _getRoleKey(tx: object, account: object): string | string[]
    create(entropy?: string): AccountWithFunctions
    createAccountKey(accountKey: string | string[] | object): AccountKey
    createAccountKeyPublic(privateKey: string | AccountKeyPublic): AccountKeyPublic
    createAccountKeyMultiSig(privateKeys: string[] | AccountKeyMultiSig): AccountKeyMultiSig
    createAccountKeyRoleBased(keyObject: RoleBasedKeyObject): AccountKeyRoleBased
    accountKeyToPublicKey(accountKey: PublicKeyObject | AccountKeyRoleBased): PublicKeyObject
    accountKeyToPublicKey(accountKey: string | AccountKeyPublic): string
    accountKeyToPublicKey(accountKey: string[] | AccountKeyMultiSig): string[]
    createWithAccountKey(address: string, accountKey: string | string[] | object): AccountWithFunctions
    createWithAccountKeyPublic(address: string, key: string | object): AccountWithFunctions
    createWithAccountKeyMultiSig(address: string, keys: string | string[] | AccountKey): AccountWithFunctions
    createWithAccountKeyRoleBased(address: string, keyObject: string | object): AccountWithFunctions
    privateKeyToAccount(key: string, userInputAddress?: string): AccountWithFunctions
    createAccountForUpdate(address: string, accountKey: string | string[] | object, options?: UpdateOptionsObject): AccountForUpdate
    createAccountForUpdateWithPublicKey(
        address: string,
        keyForUpdate: string | string[] | object,
        options?: UpdateOptionsObject
    ): AccountForUpdate
    createAccountForUpdateWithLegacyKey(address: string): AccountForUpdate
    createAccountForUpdateWithFailKey(address: string): AccountForUpdate
    isDecoupled(key: string, userInputAddress?: string): boolean
    getLegacyAccount(
        key: string
    ): {
        legacyAccount: AccountWithFunctions
        klaytnWalletKeyAddress: string
    }
    signTransaction(tx: string | object, privateKey?: string | string[], callback?: Function): Promise<TransactionObject>
    signTransaction(tx: string | object, callback?: Function): Promise<TransactionObject>
    feePayerSignTransaction(
        tx: string | object,
        feePayer: string,
        privateKey?: string | string[],
        callback?: Function
    ): Promise<TransactionObject>
    signTransactionWithHash(
        hash: string | object,
        privateKeys: string | string[],
        chainId?: string | number,
        callback?: Function
    ): Promise<SignatureObject[]>
    getRawTransactionWithSignatures(tx: object, callback?: Function): Promise<TransactionObject>
    combineSignatures(rawTransactions: string[], callback?: Function): Promise<TransactionObject>
    recoverTransaction(rawTx: string): string
    hashMessage(data: string): string
    sign(
        data: string,
        privateKey: string
    ): {
        message: string
        v: string
        r: string
        s: string
        messageHash: string
        signature: string
    }
    recover(message: object, preFixed?: boolean): string
    recover(message: string, v: string, r: string, s: string, preFixed?: boolean): string
    recover(message: string | object, signature?: string, preFixed?: boolean): string
    decrypt(v3Keystore: object, password: string, nonStrict?: boolean): Account
    encrypt(key: string | string[] | object, password: string, options?: object): Keystore
    encryptV3(key: string | AccountKey, password: string, options?: object): Keystore
    privateKeyToPublicKey(privateKey: string, compressed?: boolean): string
    encodeRLPByTxType(transaction: object): string
    setAccounts(accounts: Accounts): Accounts
}
