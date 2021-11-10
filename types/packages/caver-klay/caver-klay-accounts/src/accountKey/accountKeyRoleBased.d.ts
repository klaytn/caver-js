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

export interface DeprecatedRoleBasedKeyObject {
    transactionKey?: string | string[]
    updateKey?: string | string[]
    feePayerKey?: string | string[]
}

export class DeprecatedAccountKeyRoleBased {
    constructor(keyObj: DeprecatedRoleBasedKeyObject | DeprecatedAccountKeyRoleBased)

    type: string

    toPublicKey(toPublicKeyFunc: Function): DeprecatedRoleBasedKeyObject
    update(keys: DeprecatedAccountKeyRoleBased): void

    transactionKey: string[]
    updateKey: string[]
    feePayerKey: string[]
    readonly keys: DeprecatedRoleBasedKeyObject
    readonly defaultKey: string
    private _transactionKey: string[]
    private _updateKey: string[]
    private _feePayerKey: string[]
}
