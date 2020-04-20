/*
    Copyright 2020 The caver-js Authors
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

const RLP = require('eth-lib/lib/rlp')
const utils = require('../../../caver-utils')
const { ACCOUNT_KEY_TAG } = require('./accountKeyHelper')

/**
 * Representing an AccountKeyPublic.
 * @class
 */
class AccountKeyPublic {
    /**
     * Decodes an RLP-encoded AccountKeyPublic string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyPublic string.
     * @return {AccountKeyPublic}
     */
    static decode(rlpEncodedKey) {
        rlpEncodedKey = utils.addHexPrefix(rlpEncodedKey)
        if (!rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG))
            throw new Error(
                `Cannot decode to AccountKeyPublic. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG}: ${rlpEncodedKey}`
            )

        const publicKey = RLP.decode(`0x${rlpEncodedKey.slice(ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG.length)}`)
        return new AccountKeyPublic(publicKey)
    }

    static fromXYPoint(x, y) {
        const pubKey = utils.addHexPrefix(x) + utils.stripHexPrefix(y)
        return new AccountKeyPublic(pubKey)
    }

    /**
     * Create an instance of AccountKeyPublic.
     * @param {string} publicKey - The address of account.
     */
    constructor(publicKey) {
        if (!utils.isValidPublicKey(publicKey)) throw new Error(`Invalid public key: ${publicKey}`)
        this._publicKey = publicKey
    }

    /**
     * @type {string}
     */
    get publicKey() {
        return this._publicKey
    }

    set publicKey(p) {
        if (!utils.isValidPublicKey(p)) throw new Error(`Invalid public key: ${p}`)
        this._publicKey = p
    }

    /**
     * Returns an RLP-encoded AccountKeyPublic string.
     * @return {string}
     */
    getRLPEncoding() {
        const compressedPublicKey = utils.compressPublicKey(this.publicKey)
        return ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG + RLP.encode(compressedPublicKey).slice(2)
    }

    /**
     * Returns the x and y coordinates of publicKey.
     * @return {object}
     */
    getXYPoint() {
        const publicKeyString = this.publicKey.replace('0x', '')
        if (publicKeyString.length !== 128) throw Error('Invalid public key')

        const x = `0x${publicKeyString.slice(0, 64).replace(/^0+/, '')}`
        const y = `0x${publicKeyString.slice(64).replace(/^0+/, '')}`

        return { x, y }
    }
}

module.exports = AccountKeyPublic
