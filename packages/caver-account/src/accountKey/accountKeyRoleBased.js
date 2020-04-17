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
const AccountKeyWeightedMultiSig = require('./accountKeyWeightedMultiSig')
const AccountKeyLegacy = require('./accountKeyLegacy')
const AccountKeyPublic = require('./accountKeyPublic')
const AccountKeyFail = require('./accountKeyFail')
const utils = require('../../../caver-utils')
const { ACCOUNT_KEY_TAG } = require('./accountKeyHelper')

/**
 * Representing an AccountKeyRoleBased.
 * @class
 */
class AccountKeyRoleBased {
    /**
     * Decodes an RLP-encoded AccountKeyRoleBased string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyRoleBased string.
     * @return {AccountKeyRoleBased}
     */
    static decode(rlpEncodedKey) {
        rlpEncodedKey = utils.addHexPrefix(rlpEncodedKey)
        if (!rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG))
            throw new Error(`Cannot decode to AccountKeyRoleBased: ${rlpEncodedKey}`)

        const keys = RLP.decode(`0x${rlpEncodedKey.slice(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG.length)}`)
        const accountKeys = []
        for (const key of keys) {
            if (key.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG)) throw new Error('Nested role based key.')
            if (key.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_NIL_TAG)) {
                accountKeys.push(undefined)
            } else if (key.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_LEGACY_TAG)) {
                accountKeys.push(AccountKeyLegacy.decode(key))
            } else if (key.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG)) {
                accountKeys.push(AccountKeyPublic.decode(key))
            } else if (key.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG)) {
                accountKeys.push(AccountKeyFail.decode(key))
            } else if (key.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG)) {
                accountKeys.push(AccountKeyWeightedMultiSig.decode(key))
            } else {
                throw new Error(`Failed to decode RLP-encoded account key. Invalid RLP-encoded account key ${key}`)
            }
        }
        return new AccountKeyRoleBased(accountKeys)
    }

    /**
     * Creates an instance of AccountKeyRoleBased.
     * @param {Array.<Array.<string>>} roleBasedPubArray - An array of public key strings.
     * @param {Array.<object>} options - An array of options which defines threshold and weight.
     * @return {AccountKeyRoleBased}
     */
    static fromRoleBasedPublicKeysAndOptions(roleBasedPubArray, options) {
        const accountKeys = []
        // Format will be like below
        // publicKeyArray = [[pub, pub], [pub], [pub, pub, pub]]
        // options = [{threshold: 1, weight: [1,1]}, {}, {threshold: 1, weight: [1,1,1]}]
        for (let i = 0; i < roleBasedPubArray.length; i++) {
            if (roleBasedPubArray[i].length > 0) {
                if (roleBasedPubArray[i].length === 1 && Object.keys(options[i]).length === 0) {
                    accountKeys.push(new AccountKeyPublic(roleBasedPubArray[i][0]))
                } else {
                    accountKeys.push(AccountKeyWeightedMultiSig.fromPublicKeysAndOptions(roleBasedPubArray[i], options[i]))
                }
            } else {
                accountKeys.push(undefined)
            }
        }
        return new AccountKeyRoleBased(accountKeys)
    }

    /**
     * Create an instance of AccountKeyRoleBased.
     * @param {Array.<Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>>} accountKeyArray - A two-dimensional array containing arrays of instances of AccountKeyPublic or AccountKeyWeightedMultiSig for each role.
     */
    constructor(accountKeyArray) {
        this._accountKeys = accountKeyArray
    }

    /**
     * @type {Array.<Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>>}
     */
    get accountKeys() {
        return this._accountKeys
    }

    set accountkeys(keys) {
        this._accountKeys = keys
    }

    /**
     * Returns an RLP-encoded AccountKeyRoleBased string.
     * @return {string}
     */
    getRLPEncoding() {
        const encodedAccountKeys = []
        for (const accountKey of this.accountKeys) {
            if (accountKey === undefined) {
                encodedAccountKeys.push(ACCOUNT_KEY_TAG.ACCOUNT_KEY_NIL_TAG)
                continue
            }
            encodedAccountKeys.push(accountKey.getRLPEncoding())
        }

        return ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG + RLP.encode(encodedAccountKeys).slice(2)
    }
}

module.exports = AccountKeyRoleBased
