/*
    Copyright 2019 The caver-js Authors
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

const AccountKeyPublic = require('../accountKey/accountKeyPublic')
const AccountKeyMultiSig = require('../accountKey/accountKeyMultiSig')
const AccountKeyRoleBased = require('../accountKey/accountKeyRoleBased')
const isAddress = require('../../../../caver-utils/src/utils').isAddress
const addHexPrefix = require('../../../../caver-utils').addHexPrefix

class Account {
    static fromObject(obj) {
        return new Account(obj.address, new AccountKeyPublic(obj.privateKey))
    }

    static isAccountKey(accountKey) {
        let isAccountKey = false
        if (accountKey instanceof AccountKeyPublic) isAccountKey = true
        if (accountKey instanceof AccountKeyMultiSig) isAccountKey = true
        if (accountKey instanceof AccountKeyRoleBased) isAccountKey = true

        return isAccountKey
    }

    constructor(address, accountKey) {
        if (!address || !accountKey) throw new Error('Failed to create Account. address and accountKey are needed to create Account.')

        if (!isAddress(address)) throw new Error(`Invalid address : ${address}`)
        if (!Account.isAccountKey(accountKey)) throw new Error('Invalid accountKey.')

        address = addHexPrefix(address)

        Object.defineProperty(this, 'address', {
            get: function() {
                return address
            },
            set: function(addressInput) {
                if (!isAddress(addressInput)) throw new Error(`Invalid address : ${addressInput}`)
                address = addHexPrefix(addressInput)
            },
            enumerable: true,
        })

        Object.defineProperty(this, 'accountKey', {
            get: function() {
                return accountKey
            },
            set: function(accountKeyInput) {
                if (!Account.isAccountKey(accountKeyInput) && accountKeyInput !== null) throw new Error('Invalid accountKey.')

                if (accountKey === null || accountKeyInput === null) {
                    accountKey = accountKeyInput
                } else if (accountKey.type !== accountKeyInput.type) {
                    accountKey = accountKeyInput
                } else {
                    accountKey.update(accountKeyInput)
                }
            },
            enumerable: true,
            configurable: true,
        })

        Object.defineProperty(this, 'privateKey', {
            get: function() {
                return this.accountKey.defaultKey
            },
            set: function() {
                throw new Error(
                    'The privateKey cannot be modified. The privateKey is set to default key of accountKey, so update accountKey to modify the privateKey.'
                )
            },
            enumerable: true,
        })
    }

    get keys() {
        return this.accountKey.keys
    }

    get accountKeyType() {
        return this.accountKey.type
    }

    get transactionKey() {
        return this.accountKey.transactionKey
    }

    get updateKey() {
        return this.accountKey.updateKey
    }

    get feePayerKey() {
        return this.accountKey.feePayerKey
    }

    toPublicKey(toPublicKeyFunc) {
        return this.accountKey.toPublicKey(toPublicKeyFunc)
    }
}

module.exports = Account
