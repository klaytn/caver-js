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
 * @hideconstructor
 */
class AccountKeyPublic {
    /**
     * Decodes an RLP-encoded AccountKeyPublic string.
     *
     * @example
     * const accountKey = caver.account.accountKey.accountKeyPublic.decode('0x{encoded account key}')
     *
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

    /**
     * Creates AccountKeyPublic instance from x, y point
     *
     * @example
     * const pubKey = '0x{public key string}'
     * const [ x, y ] = caver.utils.xyPointFromPublicKey(pubKey)
     * const accountKey = caver.account.accountKey.accountKeyPublic.fromXYPoint(x, y)
     *
     * @param {string} x - The x point.
     * @param {string} y - The y point.
     * @return {AccountKeyPublic}
     */
    static fromXYPoint(x, y) {
        const xPoint = utils.leftPad(utils.stripHexPrefix(x), 64)
        const yPoint = utils.leftPad(utils.stripHexPrefix(y), 64)
        const pubKey = `0x${xPoint + yPoint}`
        return new AccountKeyPublic(pubKey)
    }

    /**
     * Creates AccountKeyPublic instance from public key string
     *
     * @example
     * const pubKey = '0x{public key string}'
     * const accountKey = caver.account.accountKey.accountKeyPublic.fromPublicKey(pubKey)
     *
     * @param {string} pubKey - The public key string. This can be in format of compressed or uncompressed.
     * @return {AccountKeyPublic}
     */
    static fromPublicKey(pubKey) {
        return new AccountKeyPublic(pubKey)
    }

    /**
     * Creates an instance of AccountKeyPublic.
     * @param {string} publicKey - a public key
     */
    constructor(publicKey) {
        this.publicKey = publicKey
    }

    /**
     * @type {string}
     */
    get publicKey() {
        return this._publicKey
    }

    set publicKey(p) {
        if (!utils.isValidPublicKey(p)) throw new Error(`Invalid public key: ${p}`)
        this._publicKey = utils.addHexPrefix(p)
    }

    /**
     * Returns an RLP-encoded AccountKeyPublic string.
     *
     * @example
     * const encoding = accountKeyPublic.getRLPEncoding()
     *
     * @return {string}
     */
    getRLPEncoding() {
        const compressedPublicKey = utils.compressPublicKey(this.publicKey)
        return ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG + RLP.encode(compressedPublicKey).slice(2)
    }

    /**
     * Returns the x and y coordinates of publicKey.
     *
     * @example
     * const xyPoint = accountKeyPublic.getXYPoint()
     *
     * @return {Array.<string>}
     */
    getXYPoint() {
        return utils.xyPointFromPublicKey(this.publicKey)
    }
}

module.exports = AccountKeyPublic
