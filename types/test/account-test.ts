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

import Caver, { Account, WeightedMultiSigOptions } from 'caver-js'
import {
    AccountKeyLegacy,
    AccountKeyPublic,
    AccountKeyFail,
    AccountKeyWeightedMultiSig,
    WeightedPublicKey,
    AccountKeyRoleBased,
} from 'packages/caver-account/src'

const caver = new Caver()
// $ExpectType typeof Account
caver.account
// $ExpectType typeof Account
Account

// $ExpectType typeof WeightedMultiSigOptions
Account.weightedMultiSigOptions

// $ExpectType (rlpEncodedKey: string) => AccountKey
Account.accountKey.decode
// $ExpectType typeof AccountKeyLegacy
Account.accountKey.accountKeyLegacy
// $ExpectType typeof AccountKeyPublic
Account.accountKey.accountKeyPublic
// $ExpectType typeof AccountKeyFail
Account.accountKey.accountKeyFail
// $ExpectType typeof AccountKeyWeightedMultiSig
Account.accountKey.accountKeyWeightedMultiSig
// $ExpectType typeof AccountKeyRoleBased
Account.accountKey.accountKeyRoleBased
// $ExpectType typeof WeightedPublicKey
Account.accountKey.weightedPublicKey

const address = '0x8d5f6e7b9cc4b0632de78afa6387bd40f72c61e3'
const pubKeys = [
    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
]

// $ExpectType Account
let account = Account.create(address, pubKeys[0])
// $ExpectType Account
account = Account.create(address, pubKeys)
// $ExpectType Account
account = Account.create(address, [pubKeys, pubKeys, pubKeys])

// $ExpectType Account
account = Account.createFromRLPEncoding(address, '0x01c0')

// $ExpectType Account
account = Account.createWithAccountKeyLegacy(address)

// $ExpectType Account
account = Account.createWithAccountKeyPublic(address, pubKeys[0])

// $ExpectType Account
account = Account.createWithAccountKeyFail(address)

const weightedMultiSigOptions = new WeightedMultiSigOptions(3, [1, 1, 1])

// $ExpectType Account
account = Account.createWithAccountKeyWeightedMultiSig(address, pubKeys)
// $ExpectType Account
account = Account.createWithAccountKeyWeightedMultiSig(address, pubKeys, { threshold: 3, weigths: [1, 1, 1] })
// $ExpectType Account
account = Account.createWithAccountKeyWeightedMultiSig(address, pubKeys, weightedMultiSigOptions)

// $ExpectType Account
account = Account.createWithAccountKeyRoleBased(address, [pubKeys, pubKeys, pubKeys])
// $ExpectType Account
account = Account.createWithAccountKeyRoleBased(
    address,
    [pubKeys, pubKeys, pubKeys],
    [{ threshold: 3, weigths: [1, 1, 1] }, { threshold: 3, weigths: [1, 1, 1] }, { threshold: 3, weigths: [1, 1, 1] }]
)
// $ExpectType Account
account = Account.createWithAccountKeyRoleBased(
    address,
    [pubKeys, pubKeys, pubKeys],
    [weightedMultiSigOptions, weightedMultiSigOptions, weightedMultiSigOptions]
)

const weigthedPublicKeys = [
    new WeightedPublicKey(1, pubKeys[0]),
    new WeightedPublicKey(1, pubKeys[1]),
    new WeightedPublicKey(1, pubKeys[2]),
]
const accountKeys = {
    legacy: new AccountKeyLegacy(),
    public: new AccountKeyPublic(pubKeys[0]),
    fail: new AccountKeyFail(),
    weightedMultisig: new AccountKeyWeightedMultiSig(3, weigthedPublicKeys),
    roleBased: new AccountKeyRoleBased([
        new AccountKeyPublic(pubKeys[0]),
        new AccountKeyWeightedMultiSig(3, weigthedPublicKeys),
        new AccountKeyLegacy(),
    ]),
}

// $ExpectType Account
account = new Account(address, accountKeys.legacy)
// $ExpectType Account
account = new Account(address, accountKeys.public)
// $ExpectType Account
account = new Account(address, accountKeys.fail)
// $ExpectType Account
account = new Account(address, accountKeys.weightedMultisig)
// $ExpectType Account
account = new Account(address, accountKeys.roleBased)

// $ExpectType string
account.address

// $ExpectType AccountKey
account.accountKey
// $ExpectType AccountKeyRoleBased
account.accountKey as AccountKeyRoleBased

// $ExpectType string
account.getRLPEncodingAccountKey()
