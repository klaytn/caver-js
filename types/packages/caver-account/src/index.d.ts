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

import { AccountKeyDecoder } from './accountKey/accountKeyDecoder'
import { AccountKeyFail } from './accountKey/accountKeyFail'
import { AccountKeyLegacy } from './accountKey/accountKeyLegacy'
import { AccountKeyPublic } from './accountKey/accountKeyPublic'
import { AccountKeyRoleBased } from './accountKey/accountKeyRoleBased'
import { AccountKeyWeightedMultiSig } from './accountKey/accountKeyWeightedMultiSig'
import { WeightedMultiSigOptions, WeightedMultiSigOptionsObject } from './accountKey/weightedMultiSigOptions'
import { WeightedPublicKey } from './accountKey/weightedPublicKey'

export * from './accountKey/accountKeyDecoder'
export * from './accountKey/accountKeyFail'
export * from './accountKey/accountKeyLegacy'
export * from './accountKey/accountKeyPublic'
export * from './accountKey/accountKeyRoleBased'
export * from './accountKey/accountKeyWeightedMultiSig'
export * from './accountKey/weightedMultiSigOptions'
export * from './accountKey/weightedPublicKey'

export type AccountKey = AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased

export interface IAccountKey {
    getRLPEncoding(): string
}

export class Account {
    static weightedMultiSigOptions: typeof WeightedMultiSigOptions
    static accountKey: {
        decode: AccountKeyDecoder['decode']
        accountKeyLegacy: typeof AccountKeyLegacy
        accountKeyPublic: typeof AccountKeyPublic
        accountKeyFail: typeof AccountKeyFail
        accountKeyWeightedMultiSig: typeof AccountKeyWeightedMultiSig
        accountKeyRoleBased: typeof AccountKeyRoleBased
        weightedPublicKey: typeof WeightedPublicKey
    }

    static create(
        address: string,
        accountKey: string | string[] | string[][],
        options?: WeightedMultiSigOptionsObject | WeightedMultiSigOptionsObject[] | WeightedMultiSigOptions | WeightedMultiSigOptions[]
    ): Account
    static createFromRLPEncoding(address: string, rlpEncodedKey: string): Account
    static createWithAccountKeyLegacy(address: string): Account
    static createWithAccountKeyPublic(address: string, publicKey: string): Account
    static createWithAccountKeyFail(address: string): Account
    static createWithAccountKeyWeightedMultiSig(
        address: string,
        publicKeyArray: string[],
        options?: WeightedMultiSigOptionsObject | WeightedMultiSigOptions
    ): Account
    static createWithAccountKeyRoleBased(
        address: string,
        roledBasedPublicKeyArray: string[][],
        options?: WeightedMultiSigOptionsObject[] | WeightedMultiSigOptions[]
    ): Account

    constructor(address: string, accountKey: AccountKey)

    address: string
    accountKey: AccountKey
    private _address: string
    private _accountKey: AccountKey

    getRLPEncodingAccountKey(): string
}
