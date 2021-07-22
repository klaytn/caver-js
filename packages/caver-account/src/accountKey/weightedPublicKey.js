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

const Bytes = require('eth-lib/lib/bytes')
const utils = require('../../../caver-utils')

/**
 * Representing a WeightedPublicKey.
 * This class is used to represent each public key with weight in {@link AccountKeyWeightedMultiSig}.
 *
 * @class
 * @hideconstructor
 */
class WeightedPublicKey {
    /**
     * Create an instance of WeightedPublicKey.
     * @param {number} weight - The weight of the key.
     * @param {string} publicKey - The public key string.
     */
    constructor(weight, publicKey) {
        this.weight = weight
        this.publicKey = publicKey
    }

    /**
     * @type {number}
     */
    get weight() {
        return this._weight
    }

    set weight(w) {
        this._weight = utils.hexToNumber(w)
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
     * Returns an encoded weighted public key string.
     *
     * @example
     * const bytes = weightedPublicKey.encodeToBytes()
     *
     * @return {string}
     */
    encodeToBytes() {
        if (this.weight === undefined) throw new Error('weight should be specified for a multisig account')
        if (this.publicKey === undefined) throw new Error('publicKey should be specified for a multisig account')

        const compressedPublicKey = utils.compressPublicKey(this.publicKey)
        return [Bytes.fromNat(utils.numberToHex(this.weight)), compressedPublicKey]
    }
}

module.exports = WeightedPublicKey
