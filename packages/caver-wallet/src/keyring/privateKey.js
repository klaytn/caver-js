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

const AccountLib = require('eth-lib/lib/account')
const Nat = require('eth-lib/lib/nat')

const elliptic = require('elliptic')

const secp256k1 = new elliptic.ec('secp256k1')

const utils = require('../../../caver-utils')
const SignatureData = require('./signatureData')

/**
 * Representing a PrivateKey class that includes private key string.
 * @class
 */
class PrivateKey {
    /**
     * creates a privateKey.
     * @param {string} key - The private key string.
     */
    constructor(key) {
        this.privateKey = key
    }

    /**
     * @type {string}
     */
    get privateKey() {
        return this._privateKey
    }

    set privateKey(p) {
        if (!utils.isValidPrivateKey(p)) throw new Error(`Invalid private key: ${p}`)
        this._privateKey = utils.addHexPrefix(p)
    }

    /**
     * signs with transactionHash with key and returns signature.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId or the network.
     * @return {SignatureData}
     */
    sign(transactionHash, chainId) {
        chainId = utils.toHex(chainId)
        const signature = AccountLib.makeSigner(Nat.toNumber(chainId) * 2 + 35)(transactionHash, this.privateKey)
        const [v, r, s] = AccountLib.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))
        return new SignatureData([v, r, s])
    }

    /**
     * signs with hashed data and returns `signature`
     *
     * @param {string} messageHash The hash of data to sign.
     * @return {SignatureData}
     */
    signMessage(messageHash) {
        const signature = AccountLib.sign(messageHash, this.privateKey)
        const [v, r, s] = AccountLib.decodeSignature(signature)
        return new SignatureData([v, r, s])
    }

    /**
     * returns public key string
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {string}
     */
    getPublicKey(compressed = false) {
        const strippedPrivateKey = utils.stripHexPrefix(this.privateKey)

        const ecKey = secp256k1.keyFromPrivate(Buffer.from(strippedPrivateKey, 'hex'))

        if (!compressed) return `0x${ecKey.getPublic(false, 'hex').slice(2)}`
        return `0x${ecKey.getPublic(true, 'hex')}`
    }

    /**
     * returns derived address from private key string
     *
     * @return {string}
     */
    getDerivedAddress() {
        return AccountLib.fromPrivate(this.privateKey).address.toLowerCase()
    }
}

module.exports = PrivateKey
