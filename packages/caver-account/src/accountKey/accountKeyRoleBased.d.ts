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

import { IAccountKey } from '..'
import AccountKeyFail from './accountKeyFail'
import AccountKeyLegacy from './accountKeyLegacy'
import AccountKeyPublic from './accountKeyPublic'
import AccountKeyWeightedMultiSig from './accountKeyWeightedMultiSig'
import WeightedMultiSigOptions from './weightedMultiSigOptions'

type NotRoleBasedAccountKey = AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig

export default class AccountKeyRoleBased implements IAccountKey {
    constructor(accountKeyArray: NotRoleBasedAccountKey[])

    static decode(rlpEncodedKey: string): AccountKeyRoleBased
    static fromRoleBasedPublicKeysAndOptions(
        roleBasedPubArray: (AccountKeyLegacy[] | AccountKeyFail | string[])[],
        options?: WeightedMultiSigOptions[] | object
    ): AccountKeyRoleBased
    getRLPEncoding(): string

    get accountKeys(): NotRoleBasedAccountKey[]
    set accountKeys(keys)
}
