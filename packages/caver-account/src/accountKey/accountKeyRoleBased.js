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

const _ = require('lodash')
const RLP = require('eth-lib/lib/rlp')
const AccountKeyWeightedMultiSig = require('./accountKeyWeightedMultiSig')
const AccountKeyLegacy = require('./accountKeyLegacy')
const AccountKeyPublic = require('./accountKeyPublic')
const AccountKeyFail = require('./accountKeyFail')
const utils = require('../../../caver-utils')
const { ACCOUNT_KEY_TAG } = require('./accountKeyHelper')
const { KEY_ROLE } = require('../../../caver-wallet/src/keyring/keyringHelper')
const WeightedMultiSigOptions = require('./weightedMultiSigOptions')

function isValidRoleBasedKeyFormat(roleBasedAccountKeys) {
    if (!_.isArray(roleBasedAccountKeys)) return false
    if (roleBasedAccountKeys.length > KEY_ROLE.roleLast) return false

    for (const accountKey of roleBasedAccountKeys) {
        if (
            accountKey !== undefined &&
            !(accountKey instanceof AccountKeyLegacy) &&
            !(accountKey instanceof AccountKeyPublic) &&
            !(accountKey instanceof AccountKeyFail) &&
            !(accountKey instanceof AccountKeyWeightedMultiSig)
        ) {
            return false
        }
    }
    return true
}

/**
 * Representing an AccountKeyRoleBased.
 * @class
 * @hideconstructor
 */
class AccountKeyRoleBased {
    /**
     * Decodes an RLP-encoded AccountKeyRoleBased string.
     *
     * @example
     * const accountKey = caver.account.accountKey.accountKeyRoleBased.decode('0x{encoded account key}')
     *
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyRoleBased string.
     * @return {AccountKeyRoleBased}
     */
    static decode(rlpEncodedKey) {
        rlpEncodedKey = utils.addHexPrefix(rlpEncodedKey)
        if (!rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG))
            throw new Error(
                `Cannot decode to AccountKeyRoleBased. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG}: ${rlpEncodedKey}`
            )

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
     *
     * @example
     * const publicKeyArray = [
     *      [ '0x{public key1}', '0x{public key2}' ], // roleTransactionKey
     *      [ '0x{public key3}', '0x{public key4}', '0x{public key5}' ], // roleAccountUpdateKey
     *      [ '0x{public key6}', '0x{public key7}', '0x{public key8}', '0x{public key9}' ], // roleFeePayerKey
     * ]
     * // For option object, you can use `new caver.account.weightedMultiSigOptions(2, [1, 1])`
     * // instead of `{ threshold: 2, weights: [1, 1] }`.
     * const options = [
     *      { threshold: 2, weights: [1, 1] },
     *      { threshold: 2, weights: [1, 1, 2] },
     *      { threshold: 3, weights: [1, 1, 2, 2] }
     * ]
     * const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(publicKeyArray, options)
     *
     * // Update only roleTransactionKey and roleFeePayerKey
     * const publicKeyArrayToUpdatePartial = [
     *      [ '0x{public key1}', '0x{public key2}' ], // roleTransactionKey
     *      [], // roleAccountUpdateKey -> If not defined the key(s) to use in the specific role, this role key is not updated.
     *      [ '0x{public key3}', '0x{public key4}' ], // roleFeePayerKey
     * ]
     * const options = [
     *      { threshold: 2, weights: [1, 1] },
     *      {},
     *      { threshold: 3, weights: [1, 2] }
     * ]
     * const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(publicKeyArrayToUpdatePartial, options)
     *
     * // Update to AccountKeyLegacy or AccountKeyFail
     * const publicKeyArrayWithLegacyAndFail = [
     *      [ '0x{public key1}', '0x{public key2}' ], // roleTransactionKey
     *      [ new caver.account.accountKey.accountKeyLegacy() ], // roleAccountUpdateKey will use AccountKeyLegacy when update an account key of the Klaytn account.
     *      [ new caver.account.accountKey.accountKeyFail() ], // roleFeePayerKey will be updated to AccountKeyFail, so this Klaytn account cannot pay a fee as a fee payer.
     * ]
     * const options = [
     *      { threshold: 2, weights: [1, 1] },
     *      {},
     *      {}
     * ]
     * const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(publicKeyArrayWithLegacyAndFail, options)
     *
     * @param {Array.<AccountKeyLegacy|AccountKeyFail|Array.<string>>} roleBasedPubArray - An array of public key strings.
     * @param {Array.<WeightedMultiSigOptions|object>} options - An array of options which defines threshold and weight.
     * @return {AccountKeyRoleBased}
     */
    static fromRoleBasedPublicKeysAndOptions(roleBasedPubArray, options) {
        if (!options) options = Array(KEY_ROLE.roleLast).fill(new WeightedMultiSigOptions())

        const accountKeys = []
        // Format will be like below
        // keyArray = [[pub, pub], [pub], [pub, pub, pub]]
        // keyArray = [[accountKeyLegacy], [accountKeyFail], [pub, pub, pub]]
        // keyArray = [['legacy'], ['fail'], []]
        // options = [{threshold: 1, weights: [1,1]}, {}, {threshold: 1, weights: [1,1,1]}]
        for (let i = 0; i < roleBasedPubArray.length; i++) {
            if (!(options[i] instanceof WeightedMultiSigOptions)) options[i] = WeightedMultiSigOptions.fromObject(options[i])

            // To handle instance of AccountKeyLegacy or AccountKeyFail
            if (!_.isArray(roleBasedPubArray[i])) {
                throw new Error(`Invalid format of keys: Each role should define the key to use in an array form.`)
            }

            // Empty key array means AccountKeyNil
            if (roleBasedPubArray[i].length === 0) {
                if (!options[i].isEmpty()) throw new Error(`Invalid options: AccountKeyNil cannot have options.`)
                accountKeys.push(undefined)
                continue
            }

            if (roleBasedPubArray[i].length === 1) {
                if (
                    roleBasedPubArray[i][0] instanceof AccountKeyLegacy ||
                    roleBasedPubArray[i][0] instanceof AccountKeyFail ||
                    roleBasedPubArray[i][0] === 'legacy' ||
                    roleBasedPubArray[i][0] === 'fail'
                ) {
                    if (!options[i].isEmpty()) throw new Error(`Invalid options: AccountKeyLegacy or AccountKeyFail cannot have options.`)

                    if (roleBasedPubArray[i][0] === 'legacy') roleBasedPubArray[i][0] = new AccountKeyLegacy()
                    if (roleBasedPubArray[i][0] === 'fail') roleBasedPubArray[i][0] = new AccountKeyFail()

                    accountKeys.push(roleBasedPubArray[i][0])
                    continue
                }
                if (options[i].isEmpty()) {
                    accountKeys.push(AccountKeyPublic.fromPublicKey(roleBasedPubArray[i][0]))
                    continue
                }
            }

            accountKeys.push(AccountKeyWeightedMultiSig.fromPublicKeysAndOptions(roleBasedPubArray[i], options[i]))
        }
        return new AccountKeyRoleBased(accountKeys)
    }

    /**
     * Create an instance of AccountKeyRoleBased.
     * @param {Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>} accountKeyArray - An array containing arrays of instances of AccountKeyPublic or AccountKeyWeightedMultiSig for each role.
     */
    constructor(accountKeyArray) {
        this.accountKeys = accountKeyArray
    }

    /**
     * @type {Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>}
     */
    get accountKeys() {
        return this._accountKeys
    }

    set accountKeys(keys) {
        if (!isValidRoleBasedKeyFormat(keys)) throw new Error(`Invalid role-based account key format.`)
        this._accountKeys = keys
    }

    /**
     * Returns an RLP-encoded AccountKeyRoleBased string.
     *
     * @example
     * const encoding = accountKeyRoleBased.getRLPEncoding()
     *
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
