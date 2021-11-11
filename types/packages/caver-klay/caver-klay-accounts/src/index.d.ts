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

import BigNumber from 'bignumber.js'
import RpcCallToMethod from '../../../caver-rtm/src'
import { SignatureObject } from '../../../caver-utils/src'
import { EncryptionOptions, Keystore, EncryptedKeystoreV3Json, EncryptedKeystoreV4Json } from '../../../caver-core/src'
import { DeprecatedAccount, DeprecatedAccountKey } from './account/account'
import { AccountForUpdate, KeyForUpdateObject } from './account/accountKeyForUpdate'
import { DeprecatedAccountKeyMultiSig } from './accountKey/accountKeyMultiSig'
import { DeprecatedAccountKeyPublic } from './accountKey/accountKeyPublic'
import { DeprecatedAccountKeyRoleBased, DeprecatedRoleBasedKeyObject } from './accountKey/accountKeyRoleBased'

export * from './account/account'
export * from './account/accountKeyForUpdate'
export * from './accountKey/accountKeyMultiSig'
export * from './accountKey/accountKeyPublic'
export * from './accountKey/accountKeyRoleBased'
export * from './accountKey/accountKeyEnum'

export interface DeprecatedTransactionObject extends KeyForUpdateObject {
    type: string
    from: string
    to?: string
    value?: string
    gas: string | number | BigNumber
    gasPrice: string | number | BigNumber
    data?: string
    input?: string
    nonce: number | string
    feePayer?: string
    codeFormat?: string
    humanReadable?: boolean
    feeRatio?: string
    key?: AccountForUpdate
}

export interface UpdateOptionsObject {
    threshold?: number
    weight?: number[]
    updateKey?: UpdateOptionsObject
    transactionKey?: UpdateOptionsObject
    feePayerKey?: UpdateOptionsObject
}

export class AccountWithFunctions extends DeprecatedAccount {
    signTransaction(tx: string | object, callback?: Function): Promise<DeprecatedTransactionObject>
    feePayerSignTransaction(tx: string | object, callback?: Function): Promise<DeprecatedTransactionObject>
    sign(data: string): DeprecatedTransactionObject
    encrypt(password: string, options?: object): object
    getKlaytnWalletKey(addressOrIndex?: string | number): string
}

export class DeprecatedAccountInWallet extends DeprecatedAccount {
    index: number
}

export class Wallet {
    constructor(accounts: Accounts)

    length: 0
    defaultKeyName: 'caverjs_wallet'

    create(numberOfAccounts: number, entropy?: string): Wallet
    add(account: string | DeprecatedAccount | DeprecatedAccountKey | object, userInputAddrees?: string): DeprecatedAccountInWallet
    updatePrivateKey(privateKey: string, address: string): DeprecatedAccountInWallet
    updateAccountKey(
        address: string,
        accountKey: string | string[] | DeprecatedRoleBasedKeyObject | DeprecatedAccountKey
    ): DeprecatedAccountInWallet
    remove(addressOrIndex: string | number): boolean
    clear(): Wallet
    encrypt(password: string, options?: EncryptionOptions): EncryptedKeystoreV4Json[]
    decrypt(encryptedWallet: Keystore[], password: string): Wallet
    save(password: string, keyName: string): boolean
    load(password: string, keyName: string): Wallet
    getKlaytnWalletKey(addressOrIndex: string | number): string
    getAccount(input: string | number): DeprecatedAccountInWallet
}

export class Accounts {
    constructor(...args: any[])

    wallet: Wallet

    _klaytnCall: {
        getChainId: RpcCallToMethod['klay_chainID']
        getGasPrice: RpcCallToMethod['klay_gasPrice']
        getTransactionCount: RpcCallToMethod['klay_getTransactionCount']
    }
    _getRoleKey(tx: object, account: object): string | string[]
    create(entropy?: string): AccountWithFunctions
    createAccountKey(accountKey: string | string[] | object): DeprecatedAccountKey
    createAccountKeyPublic(privateKey: string | DeprecatedAccountKeyPublic): DeprecatedAccountKeyPublic
    createAccountKeyMultiSig(privateKeys: string[] | DeprecatedAccountKeyMultiSig): DeprecatedAccountKeyMultiSig
    createAccountKeyRoleBased(keyObject: DeprecatedRoleBasedKeyObject): DeprecatedAccountKeyRoleBased
    accountKeyToPublicKey(accountKey: DeprecatedRoleBasedKeyObject | DeprecatedAccountKeyRoleBased): DeprecatedRoleBasedKeyObject
    accountKeyToPublicKey(accountKey: string | DeprecatedAccountKeyPublic): string
    accountKeyToPublicKey(accountKey: string[] | DeprecatedAccountKeyMultiSig): string[]
    createWithAccountKey(address: string, accountKey: string | string[] | object): AccountWithFunctions
    createWithAccountKeyPublic(address: string, key: string | object): AccountWithFunctions
    createWithAccountKeyMultiSig(address: string, keys: string | string[] | DeprecatedAccountKey): AccountWithFunctions
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
    signTransaction(tx: string | object, privateKey?: string | string[], callback?: Function): Promise<DeprecatedTransactionObject>
    signTransaction(tx: string | object, callback?: Function): Promise<DeprecatedTransactionObject>
    feePayerSignTransaction(
        tx: string | object,
        feePayer: string,
        privateKey?: string | string[],
        callback?: Function
    ): Promise<DeprecatedTransactionObject>
    signTransactionWithHash(
        hash: string | object,
        privateKeys: string | string[],
        chainId?: string | number,
        callback?: Function
    ): Promise<SignatureObject[]>
    getRawTransactionWithSignatures(tx: object, callback?: Function): Promise<DeprecatedTransactionObject>
    combineSignatures(rawTransactions: string[], callback?: Function): Promise<DeprecatedTransactionObject>
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
    decrypt(keystore: Keystore, password: string, nonStrict?: boolean): DeprecatedAccount
    encrypt(key: string | string[] | object, password: string, options?: object): EncryptedKeystoreV4Json
    encryptV3(key: string | DeprecatedAccountKey, password: string, options?: object): EncryptedKeystoreV3Json
    privateKeyToPublicKey(privateKey: string, compressed?: boolean): string
    encodeRLPByTxType(transaction: object): string
    setAccounts(accounts: Accounts): Accounts
}
