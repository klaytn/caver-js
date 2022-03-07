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
 * @hideconstructor
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
     * Signs with transactionHash with key and returns signature.
     *
     * @example
     * const signature = privateKey.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810')
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId or the network.
     * @return {SignatureData} A {@link SignatureData}.
     */
    sign(transactionHash, chainId) {
        let addToV
        if (chainId === undefined) {
            throw new Error(`Insufficient parameters: chainId is undefined.`)
        } else {
            chainId = utils.toHex(chainId)
            addToV = Nat.toNumber(chainId) * 2 + 35
        }
        const signature = AccountLib.makeSigner(addToV)(transactionHash, this.privateKey)
        const [v, r, s] = AccountLib.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))
        return new SignatureData([v, r, s])
    }

    /**
     * Signs with hashed data and returns signature data.
     * ecsign returns a signature which has v as a parity (0 for even, 1 for odd) of the y-value of a secp256k1 signature.
     *
     * @example
     * const signature = privateKey.ecsign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550')
     *
     * @param {string} hash The hash to sign.
     * @return {SignatureData} A {@link SignatureData}.
     */
    ecsign(hash) {
        // ecsign returns recovery id `v` as y-parity (0 or 1).
        // `AccountLib.makeSigner` makes a sign function that adds addToV to `v`, so use 0.
        const addToV = 0
        const signature = AccountLib.makeSigner(addToV)(hash, this.privateKey)
        let [v, r, s] = AccountLib.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))
        // This is for converting '0x' to '0x0'
        v = utils.toHex(utils.hexToNumber(v))

        return new SignatureData([v, r, s])
    }

    /**
     * Signs with hashed data and returns `signature`.
     *
     * @example
     * const signature = privateKey.signMessage('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550')
     *
     * @param {string} messageHash The hash of data to sign.
     * @return {SignatureData} A {@link SignatureData}.
     */
    signMessage(messageHash) {
        const signature = AccountLib.sign(messageHash, this.privateKey)
        const [v, r, s] = AccountLib.decodeSignature(signature)
        return new SignatureData([v, r, s])
    }

    /**
     * Returns public key string.
     *
     * @example
     * const publicKey = privateKey.getPublicKey()
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {string} A public key string which is derived from private key string.
     */
    getPublicKey(compressed = false) {
        const strippedPrivateKey = utils.stripHexPrefix(this.privateKey)

        const ecKey = secp256k1.keyFromPrivate(Buffer.from(strippedPrivateKey, 'hex'))

        if (!compressed) return `0x${ecKey.getPublic(false, 'hex').slice(2)}`
        return `0x${ecKey.getPublic(true, 'hex')}`
    }

    /**
     * Returns derived address from private key string.
     *
     * @example
     * const address = privateKey.getDerivedAddress()
     *
     * @return {string} A address which is derived from private key string.
     */
    getDerivedAddress() {
        return AccountLib.fromPrivate(this.privateKey).address.toLowerCase()
    }
}

module.exports = PrivateKey
