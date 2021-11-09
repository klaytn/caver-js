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

import AccountKeyMultiSig from '../accountKey/accountKeyMultiSig'
import AccountKeyPublic from '../accountKey/accountKeyPublic'
import AccountKeyRoleBased, { RoleBasedKeyObject } from '../accountKey/accountKeyRoleBased'

export type AccountKey = AccountKeyPublic | AccountKeyMultiSig | AccountKeyRoleBased

export default class Account {
    static fromObject(obj: { address: string; privateKey: string }): Account
    static isAccountKey(accountKey: any): boolean

    constructor(address: string, accountKey: string | string[] | RoleBasedKeyObject)

    toPublicKey(toPublicKeyFunc: Function): string | string[] | RoleBasedKeyObject

    address: string
    accountKey: AccountKey
    readonly privateKey: string
    readonly keys: string
    readonly accountKeyType: string
    readonly transactionKey: string
    readonly updateKey: string
    readonly feePayerKey: string
    private _address: string
    private _accountKey: AccountKey
}
