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

const AccountKeyEnum = require('./accountKeyEnum').AccountKeyEnum

class AccountKeyPublic {
    constructor(key) {
        if (key instanceof AccountKeyPublic) key = key.keys

        if (typeof key !== 'string') throw new Error('To create AccountKeyPublic, a private key strings is required.')
        this._key = key
        this.type = AccountKeyEnum.ACCOUNT_KEY_PUBLIC
    }

    get defaultKey() {
        return this._key
    }

    get keys() {
        return this._key
    }

    get transactionKey() {
        return this._key
    }

    get updateKey() {
        return this._key
    }

    get feePayerKey() {
        return this._key
    }

    toPublicKey(toPublicKeyFunc) {
        return toPublicKeyFunc(this._key)
    }

    update(key) {
        this._key = key.keys
    }
}

module.exports = AccountKeyPublic
