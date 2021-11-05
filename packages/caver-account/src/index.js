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
 *
 * @class
 * @hideconstructor
 */
class Account {
    /**
     * Creates an Account instance with an address and an accountKey.
     *
     * If `accountKey` is a public key string, an `Account` instance with `AccountKeyPublic` as accountKey is created.
     *
     * If `accountKey` is an array containing public key strings, an `Account` instance with `AccountKeyWeightedMultiSig` as accountKey is created.
     * If options are not defined as the last parameter, it is created using a default option with a threshold of 1 and a weight of 1 for each key.
     *
     * If `accountKey` is an array containing accountKeys that are used for each role, an `Account` instance with `AccountKeyRoleBased` is created.
     * Options must be defined for each role with WeightedMultiSigOptions (or object).
     * If options are not defined, the default option is used for roles that use multiple public keys.
     *
     * @example
     * // Create an account instance with AccountKeyPublic
     * caver.account.create('0x{address in hex}', '0x{public key}')
     *
     * // Create an account instance with AccountKeyWeightedMultiSig
     * caver.account.create('0x{address in hex}', ['0x{public key}', '0x{public key}'], { threshold: 1, weight: [1, 1] })
     *
     * // Create an account instance with AccountKeyWeightedMultiSig (use the WeightedMultiSigOptions)
     * const options = new caver.account.weightedMultiSigOptions(1, [1, 1])
     * caver.account.create('0x{address in hex}', ['0x{public key}', '0x{public key}'], options)
     *
     * // Create an account instance with AccountKeyRoleBased
     * caver.account.create('0x{address in hex}', [['0x{public key}'], ['0x{public key}', '0x{public key}'], ['0x{public key}']], [{}, { threshold: 1, weight: [1, 1] }, {}])
     *
     * // Create an account instance with AccountKeyRoleBased (use the WeightedMultiSigOptions)
     * const options = [
     *      {},
     *      new caver.account.weightedMultiSigOptions(1, [1, 1]),
     *      {}
     * ]
     * caver.account.create('0x{address in hex}', [['0x{public key}'], ['0x{public key}', '0x{public key}'], ['0x{public key}']], options)
     *
     * @param {string} address The address of Account.
     * @param {string|Array.<string>|Array.<Array.<string>>} accountKey The accountKey value of Account. Depending on this, Account's accountKey will be AccountKeyLegacy / AccountKeyPublic / AccountKeyFail / AccountKeyWeightedMultiSig / AccountKeyRoleBased.
     * @param {object|Array.<object>|WeightedMultiSigOptions|Array.<WeightedMultiSigOptions>} [options] The options that includes 'threshold' and 'weight'. This is only necessary if AccountKeyWeightedMultiSig or AccountKeyRoleBased.
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
     * Creates an Account instance from RLP-encoded account key.
     *
     * @example
     * caver.account.createFromRLPEncoding('0x{address in hex}', '0x04f84...')
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
     * Creates an Account instance which has AccountKeyLegacy as an accountKey.
     *
     * @example
     * caver.account.createWithAccountKeyLegacy('0x{address in hex}')
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    static createWithAccountKeyLegacy(address) {
        return new Account(address, new AccountKeyLegacy())
    }

    /**
     * Creates an Account instance which has AccountKeyPublic as an accountKey.
     *
     * @example
     * caver.account.createWithAccountKeyPublic('0x{address in hex}', '0xb5a9a...')
     *
     * @param {string} address The address of Account.
     * @param {string} publicKey The public key string.
     * @return {Account}
     */
    static createWithAccountKeyPublic(address, publicKey) {
        return new Account(address, new AccountKeyPublic(publicKey))
    }

    /**
     * Creates an Account instance which has AccountKeyFail as an accountKey.
     *
     * @example
     * caver.account.createWithAccountKeyFail('0x{address in hex}')
     *
     * @param {string} address The address of Account.
     * @return {Account}
     */
    static createWithAccountKeyFail(address) {
        return new Account(address, new AccountKeyFail())
    }

    /**
     * Creates an Account instance which has AccountKeyWeightedMultiSig as an accountKey.
     * If options are not defined as the last parameter, it is created using a default option with a threshold of 1 and a weight of 1 for each key.
     *
     * @example
     * // create an Account instance without options
     * caver.account.createWithAccountKeyWeightedMultiSig('0x{address in hex}', ['0xb5a9a...', '0xfe4b8...'])
     *
     * // create an Account instance with options
     * const options = { threshold: 2, weight: [1,1] }
     * caver.account.createWithAccountKeyWeightedMultiSig('0x{address in hex}', ['0xb5a9a...', '0xfe4b8...'], options)
     *
     * // create an Account instance with options (use the WeightedMultiSigOptions)
     * const options = new caver.account.weightedMultiSigOptions(2, [1, 1])
     * caver.account.createWithAccountKeyWeightedMultiSig('0x{address in hex}', ['0xb5a9a...', '0xfe4b8...'], options)
     *
     * @param {string} address The address of Account.
     * @param {Array.<string>} publicKeyArray The array that includes multiple public key strings.
     * @param {object|WeightedMultiSigOptions} [options] The object that includes threshold and weight array.
     * @return {Account}
     */
    static createWithAccountKeyWeightedMultiSig(address, publicKeyArray, options) {
        if (!utils.isAddress(address)) throw new Error(`Invalid address: ${address}`)
        if (!_.isArray(publicKeyArray)) throw new Error(`Invalid public key array: ${publicKeyArray}`)
        return new Account(address, AccountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicKeyArray, options))
    }

    /**
     * Creates an Account instance which has AccountKeyRoleBased as an accountKey.
     * If options are not defined, the default option is used for roles that use multiple public keys.
     *
     * @example
     * // create an Account instance without options
     * const publicKeys = [
     *     ['0x034f1...', '0xfe4b8...'],
     *     ['0xb5a9a...'],
     *     ['0x034f1...', '0xb5a9a...']
     * ]
     * caver.account.createWithAccountKeyRoleBased('0x{address in hex}', publicKeys)
     *
     * // create an Account instance with options
     * const options = [
     *     { threshold: 2, weight: [1, 1] },
     *     {},
     *     { threshold: 3, weight: [1, 2] }
     * ]
     * caver.account.createWithAccountKeyRoleBased('0x{address in hex}', publicKeys, options)
     *
     * // create an Account instance with options (use the WeightedMultiSigOptions)
     * const options = [
     *     new caver.account.weightedMultiSigOptions(2, [1, 1]),
     *     new caver.account.weightedMultiSigOptions(),
     *     new caver.account.weightedMultiSigOptions(3, [1, 2])
     * ]
     * caver.account.createWithAccountKeyRoleBased('0x{address in hex}', publicKeys, options)
     *
     * @param {string} address The address of Account.
     * @param {Array.<Array.<string>>} roledBasedPublicKeyArray A two-dimensional array containing arrays of public key strings for each role.
     * @param {Array.<object|WeightedMultiSigOptions>} [options] An array that contains objects with threshold and weight array defined for each role.
     * @return {Account}
     */
    static createWithAccountKeyRoleBased(address, roledBasedPublicKeyArray, options) {
        return new Account(address, AccountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(roledBasedPublicKeyArray, options))
    }

    /**
     * The account key types which are used in the `caver.account` package.
     *
     * @typedef {AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig|AccountKeyRoleBased} Account.AccountKey
     */
    /**
     * Creates an account. It is recommended to use [caver.account.create]{@link Account#create} rather than using the constructor directly.
     *
     * @example
     * const accountKey = new caver.account.accountKey.accountKeyLegacy()
     * const account = new caver.account('0x{address in hex}', accountKey)
     *
     * @constructor
     * @hideconstructor
     * @param {string} address - The address of account.
     * @param {Account.AccountKey} accountKey - The accountKey of account.
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
     * @type {Account.AccountKey}
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
     * @example
     * const encodedAccountKey = account.getRLPEncodingAccountKey()
     *
     * @return {string}
     */
    getRLPEncodingAccountKey() {
        return this._accountKey.getRLPEncoding()
    }
}

/**
 * @example
 * caver.account.weightedMultiSigOptions
 *
 * @type {typeof WeightedMultiSigOptions}
 * */
Account.weightedMultiSigOptions = WeightedMultiSigOptions

/**
 * A module that provides functions for accountKey.
 *
 * @typedef {object} AccountKeyModule
 * @property {function} decode - A function to decode the accountKey. Please refer to {@link AccountKeyDecoder.decode|caver.account.accountKey.decode}.
 * @property {typeof AccountKeyLegacy} accountKeyLegacy - Class representing accountKeyLegacy.
 * @property {typeof AccountKeyPublic} accountKeyPublic - Class representing AccountKeyPublic.
 * @property {typeof AccountKeyFail} accountKeyFail - Class representing AccountKeyFail.
 * @property {typeof AccountKeyWeightedMultiSig} accountKeyWeightedMultiSig - Class representing AccountKeyWeightedMultiSig.
 * @property {typeof AccountKeyRoleBased} accountKeyRoleBased - Class representing AccountKeyRoleBased.
 * @property {typeof WeightedPublicKey} weightedPublicKey - Class representing WeightedPublicKey.
 */
/**
 * @example
 * caver.account.accountKey
 * caver.account.accountKey.decode('0x{encoded account key}')
 * caver.account.accountKey.accountKeyLegacy
 * caver.account.accountKey.accountKeyPublic
 * caver.account.accountKey.accountKeyFail
 * caver.account.accountKey.accountKeyWeightedMultiSig
 * caver.account.accountKey.accountKeyRoleBased
 * caver.account.accountKey.weightedPublicKey
 *
 * @type {AccountKeyModule}
 * */
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
