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
const utils = require('../../caver-utils')
const AccountKeyDecoder = require('./accountKey/accountKeyDecoder')
const AccountKeyLegacy = require('./accountKey/accountKeyLegacy')
const AccountKeyPublic = require('./accountKey/accountKeyPublic')
const AccountKeyFail = require('./accountKey/accountKeyFail')
const AccountKeyWeightedMultiSig = require('./accountKey/accountKeyWeightedMultiSig')
const AccountKeyRoleBased = require('./accountKey/accountKeyRoleBased')
const WeightedMultiSigOptions = require('./accountKey/weightedMultiSigOptions')
const WeightedPublicKey = require('./accountKey/weightedPublicKey')
const { isMultipleKeysFormat, isRoleBasedKeysFormat } = require('../../caver-wallet/src/keyring/keyringHelper')

function isAccountKeyInstance(accountKey) {
    if (
        !(accountKey instanceof AccountKeyLegacy) &&
        !(accountKey instanceof AccountKeyPublic) &&
        !(accountKey instanceof AccountKeyFail) &&
        !(accountKey instanceof AccountKeyWeightedMultiSig) &&
        !(accountKey instanceof AccountKeyRoleBased)
    )
        return false

    return true
}
/**
 * Representing an Account which includes information for account update.
 * @class
 */
class Account {
    /**
     * creates an Account instance
     *
     * `caver.account.create('0x${address in hex}', '0x{public key}')`
     * `caver.account.create('0x${address in hex}', ['0x{public key}', '0x{public key}'], { threshold: 1, weight: [1,1] })`
     * `caver.account.create('0x${address in hex}', [['0x{public key}'], ['0x{public key}', '0x{public key}'], ['0x{public key}']], [{}, { threshold: 1, weight: [1,1] }, {}])`
     *
     * @param {string} address The address of Account.
     * @param {string|Array.<string>|Array.<Array.<string>>} accountKey The accountKey value of Account. Depending on this, Account's accountKey will be AccountKeyLegacy / AccountKeyPublic / AccountKeyFail / AccountKeyWeightedMultiSig / AccountKeyRoleBased.
     * @param {WeightedMultiSigOptions|Array.<WeightedMultiSigOptions>} [options] The options that includes 'threshold' and 'weight'. This is only necessary if AccountKeyWeightedMultiSig or AccountKeyRoleBased.
     * @return {Account}
     */
    static create(address, accountKey, options) {
        if (_.isString(accountKey)) {
            if (utils.isValidPublicKey(accountKey)) {
                return Account.createWithAccountKeyPublic(address, accountKey)
            }
            return Account.createFromRLPEncoding(address, accountKey)
        }

        if (isMultipleKeysFormat(accountKey)) {
            if (accountKey.length === 0) throw new Error(`Empty accountKey array.`)
            return Account.createWithAccountKeyWeightedMultiSig(address, accountKey, options)
        }
        if (isRoleBasedKeysFormat(accountKey)) {
            return Account.createWithAccountKeyRoleBased(address, accountKey, options)
        }

        throw new Error(`Unsupported accountKey type: ${typeof accountKey}`)
    }

    /**
     * creates an Account instance from RLP-encoded account key
     *
     * @param {string} address The address of Account.
     * @param {string} rlpEncodedKey The RLP-encoded accountKey string.
     * @return {Account}
     */
    static createFromRLPEncoding(address, rlpEncodedKey) {
        const accountKey = AccountKeyDecoder.decode(rlpEncodedKey)
        return new Account(address, accountKey)
    }

    /**
     * creates an Account instance which has AccountKeyLegacy as an accountKey
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    static createWithAccountKeyLegacy(address) {
        return new Account(address, new AccountKeyLegacy())
    }

    /**
     * creates an Account instance which has AccountKeyPublic as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {string} publicKey The public key string.
     * @return {Account}
     */
    static createWithAccountKeyPublic(address, publicKey) {
        return new Account(address, new AccountKeyPublic(publicKey))
    }

    /**
     * creates an Account instance which has AccountKeyFail as an accountKey
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    static createWithAccountKeyFail(address) {
        return new Account(address, new AccountKeyFail())
    }

    /**
     * creates an Account instance which has AccountKeyWeightedMultiSig as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {Array} publicKeyArray The array that includes multiple public key strings.
     * @param {Object} [options] The object that includes threshold and weight array.
     * @return {Account}
     */
    static createWithAccountKeyWeightedMultiSig(address, publicKeyArray, options) {
        return new Account(address, AccountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicKeyArray, options))
    }

    /**
     * creates an Account instance which has AccountKeyRoleBased as an accountKey
     *
     * @param {string} address The address of Account.
     * @param {Array} roledBasedPublicKeyArray A two-dimensional array containing arrays of public key strings for each role.
     * @param {Array} [options] An array that contains objects with threshold and weight array defined for each role.
     * @return {Account}
     */
    static createWithAccountKeyRoleBased(address, roledBasedPublicKeyArray, options) {
        return new Account(address, AccountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(roledBasedPublicKeyArray, options))
    }

    /**
     * Create an account.
     * @param {string} address - The address of account.
     * @param {AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig|AccountKeyRoleBased} accountKey - The accountKey of account.
     */
    constructor(address, accountKey) {
        this.address = address
        this.accountKey = accountKey
    }

    /**
     * @type {string}
     */
    get address() {
        return this._address
    }

    set address(addressInput) {
        if (!utils.isAddress(addressInput)) throw new Error(`Invalid address : ${addressInput}`)

        this._address = utils.addHexPrefix(addressInput)
    }

    /**
     * @type {AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig|AccountKeyRoleBased}
     */
    get accountKey() {
        return this._accountKey
    }

    set accountKey(accountKey) {
        if (!isAccountKeyInstance(accountKey))
            throw new Error(
                `Invalid accountKey. accountKey should be an instance of AccountKeyLegacy, AccountKeyPublic, AccountKeyFail, AccountKeyWeightedMultiSig or AccountKeyRoleBased`
            )

        this._accountKey = accountKey
    }

    /**
     * returns RLP-encoded account key string.
     *
     * @return {string}
     */
    getRLPEncodingAccountKey() {
        return this._accountKey.getRLPEncoding()
    }
}

Account.weightedMultiSigOptions = WeightedMultiSigOptions

Account.accountKey = {
    decode: AccountKeyDecoder.decode,
    accountKeyLegacy: AccountKeyLegacy,
    accountKeyPublic: AccountKeyPublic,
    accountKeyFail: AccountKeyFail,
    accountKeyWeightedMultiSig: AccountKeyWeightedMultiSig,
    accountKeyRoleBased: AccountKeyRoleBased,
    weightedPublicKey: WeightedPublicKey,
}

module.exports = Account
