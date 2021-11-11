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
const Bytes = require('eth-lib/lib/bytes')
const _ = require('lodash')
const WeightedPublicKey = require('./weightedPublicKey')
const utils = require('../../../caver-utils')
const { ACCOUNT_KEY_TAG, fillWeightedMultiSigOptionsForMultiSig } = require('./accountKeyHelper')

const MAXIMUM_WEIGTHED_KEYS_LENGTH = 10

/**
 * Representing an AccountKeyWeightedMultiSig.
 * @class
 * @hideconstructor
 */
class AccountKeyWeightedMultiSig {
    /**
     * Decodes an RLP-encoded AccountKeyWeightedMultiSig string.
     *
     * @example
     * const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.decode('0x{encoded account key}')
     *
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyWeightedMultiSig string.
     * @return {AccountKeyWeightedMultiSig}
     */
    static decode(rlpEncodedKey) {
        rlpEncodedKey = utils.addHexPrefix(rlpEncodedKey)
        if (!rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG))
            throw new Error(
                `Cannot decode to AccountKeyWeightedMultiSig. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG}: ${rlpEncodedKey}`
            )

        const [threshold, multiSigkeys] = RLP.decode(`0x${rlpEncodedKey.slice(ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG.length)}`)
        const weightedPublicKeys = multiSigkeys.map(weightedPublicKey => {
            return new WeightedPublicKey(weightedPublicKey[0], weightedPublicKey[1])
        })
        return new AccountKeyWeightedMultiSig(threshold, weightedPublicKeys)
    }

    /**
     * Creates an instance of AccountKeyWeighedMultiSig.
     *
     * @example
     * const publicKeyArray = [ '0x{public key1}', '0x{public key2}' ]
     * const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicKeyArray)
     *
     * // with options
     * const publicKeyArray = [ '0x{public key1}', '0x{public key2}' ]
     * // For option object, you can use `new caver.account.weightedMultiSigOptions(2, [1, 1])`
     * // instead of `{ threshold: 2, weights: [1, 1] }`.
     * const options = { threshold: 2, weights: [1, 1] }
     * const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicKeyArray, options)
     *
     * @param {Array.<string>} publicKeyArray - An array of public key strings.
     * @param {WeightedMultiSigOptions|object} [options] - An options which defines threshold and weight.
     * @return {AccountKeyWeightedMultiSig}
     */
    static fromPublicKeysAndOptions(publicKeyArray, options) {
        options = fillWeightedMultiSigOptionsForMultiSig(publicKeyArray.length, options)
        if (publicKeyArray.length !== options.weights.length) {
            throw new Error(`The length of public keys is not equal to the length of weight array.`)
        }

        const weightedPublicKeys = []

        for (let i = 0; i < publicKeyArray.length; i++) {
            const weightedPublicKey = new WeightedPublicKey(options.weights[i], publicKeyArray[i])
            weightedPublicKeys.push(weightedPublicKey)
        }

        return new AccountKeyWeightedMultiSig(options.threshold, weightedPublicKeys)
    }

    /**
     * Create an instance of AccountKeyWeightedMultiSig.
     * @param {number} threshold - The threshold of accountKey.
     * @param {Array.<WeightedPublicKey>} weightedPublicKeys - An array of instances of WeightedPublicKeys
     */
    constructor(threshold, weightedPublicKeys) {
        this.threshold = threshold

        this.weightedPublicKeys = weightedPublicKeys || []
    }

    /**
     * @type {Number}
     */
    get threshold() {
        return this._threshold
    }

    set threshold(t) {
        this._threshold = utils.hexToNumber(t)
    }

    /**
     * @type {Array.<WeightedPublicKey>}
     */
    get weightedPublicKeys() {
        return this._weightedPublicKeys
    }

    set weightedPublicKeys(wps) {
        if (!_.isArray(wps)) throw new Error(`Invalid weighted public keys type. Please use an array for weightedPublicKeys.`)
        if (wps.length > MAXIMUM_WEIGTHED_KEYS_LENGTH)
            throw new Error(`Invalid weighted public keys: The number of keys exceeds the limit (${MAXIMUM_WEIGTHED_KEYS_LENGTH}).`)
        for (const wp of wps) {
            if (!(wp instanceof WeightedPublicKey)) throw new Error(`Invalid type of weighted public keys.`)
        }
        this._weightedPublicKeys = wps
    }

    /**
     * Returns an RLP-encoded AccountKeyWeightedMultiSig string.
     *
     * @example
     * const encoding = accountKeyWeightedMultiSig.getRLPEncoding()
     *
     * @return {string}
     */
    getRLPEncoding() {
        if (this.threshold === undefined) throw new Error('threshold should be specified for a multisig account')
        if (this.weightedPublicKeys.length === 0) throw new Error('weightedPublicKeys should be specified for a multisig account')

        const encodedMultisigPublicKeys = []
        for (const weightedPublicKey of this.weightedPublicKeys) {
            if (weightedPublicKey.weight === undefined) throw new Error('weight should be specified for a multisig account')
            if (weightedPublicKey.publicKey === undefined) throw new Error('publicKey should be specified for a multisig account')

            const compressedPublicKey = utils.compressPublicKey(weightedPublicKey.publicKey)

            encodedMultisigPublicKeys.push([Bytes.fromNat(utils.numberToHex(weightedPublicKey.weight)), compressedPublicKey])
        }

        return (
            ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG +
            RLP.encode([Bytes.fromNat(utils.numberToHex(this.threshold)), encodedMultisigPublicKeys]).slice(2)
        )
    }
}

module.exports = AccountKeyWeightedMultiSig
