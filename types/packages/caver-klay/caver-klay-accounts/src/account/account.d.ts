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

import { DeprecatedAccountKeyMultiSig } from '../accountKey/accountKeyMultiSig'
import { DeprecatedAccountKeyPublic } from '../accountKey/accountKeyPublic'
import { DeprecatedAccountKeyRoleBased, DeprecatedRoleBasedKeyObject } from '../accountKey/accountKeyRoleBased'

export type DeprecatedAccountKey = DeprecatedAccountKeyPublic | DeprecatedAccountKeyMultiSig | DeprecatedAccountKeyRoleBased

export class DeprecatedAccount {
    static fromObject(obj: { address: string; privateKey: string }): DeprecatedAccount
    static isAccountKey(accountKey: any): boolean

    constructor(address: string, accountKey: string | string[] | DeprecatedRoleBasedKeyObject)

    toPublicKey(toPublicKeyFunc: Function): string | string[] | DeprecatedRoleBasedKeyObject

    address: string
    accountKey: DeprecatedAccountKey
    readonly privateKey: string
    readonly keys: string
    readonly accountKeyType: string
    readonly transactionKey: string
    readonly updateKey: string
    readonly feePayerKey: string
    private _address: string
    private _accountKey: DeprecatedAccountKey
}
