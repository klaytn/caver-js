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

/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

const _ = require('lodash')

const utils = require('../../../caver-utils')
const PrivateKey = require('./privateKey')
const { KEY_ROLE, MAXIMUM_KEY_NUM, isMultipleKeysFormat, isRoleBasedKeysFormat } = require('./keyringHelper')
const Account = require('../../../caver-account')
const { fillWeightedMultiSigOptionsForRoleBased } = require('../../../caver-account/src/accountKey/accountKeyHelper')
const { validateForSigning, validateIndexWithKeys, encryptKey, formatEncrypted } = require('./keyringHelper')

/**
 * representing a Keyring which includes `address` and `private keys` by roles.
 * @class
 */
class RoleBasedKeyring {
    /**
     * creates a RoleBasedKeyring.
     * @param {string} address - The address of keyring.
     * @param {Array.<Array<string>>|Array.<Array<PrivateKey>>} keys - The keys to use in RoleBasedKeyring.
     */
    constructor(address, keys) {
        this.address = address
        this.keys = keys
    }

    /**
     * @type {string}
     */
    get address() {
        return this._address
    }

    set address(addressInput) {
        if (!utils.isAddress(addressInput)) throw new Error(`Invalid address : ${addressInput}`)

        this._address = utils.addHexPrefix(addressInput).toLowerCase()
    }

    /**
     * @type {Array.<Array.<PrivateKey>>}
     */
    get keys() {
        return this._keys
    }

    set keys(keyInput) {
        if (keyInput === null) {
            this._key = null
            return
        }

        this._keys = formattingForKeyInKeyring(keyInput)
    }

    /**
     * @type {Array.<PrivateKey>}
     */
    get roleTransactionKey() {
        return this.getKeyByRole(KEY_ROLE.roleTransactionKey)
    }

    /**
     * @type {Array.<PrivateKey>}
     */
    get roleAccountUpdateKey() {
        return this.getKeyByRole(KEY_ROLE.roleAccountUpdateKey)
    }

    /**
     * @type {Array.<PrivateKey>}
     */
    get roleFeePayerKey() {
        return this.getKeyByRole(KEY_ROLE.roleFeePayerKey)
    }

    /**
     * returns public key strings in format of role-based.
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {Array.<Array<string>>}
     */
    getPublicKey(compressed = false) {
        const publicKeys = generateKeysFormat()
        for (let i = 0; i < KEY_ROLE.roleLast; i++) {
            for (const k of this._keys[i]) {
                publicKeys[i].push(k.getPublicKey(compressed))
            }
        }
        return publicKeys
    }

    /**
     * returns a copied roleBasedKeyring instance
     *
     * @return {RoleBasedKeyring}
     */
    copy() {
        return new RoleBasedKeyring(this.address, this.keys)
    }

    /**
     * signs with transactionHash with key and returns signature.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId specific to the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. If index is undefined, all private keys in keyring will be used.
     * @return {Array.<string>|Array.<Array.<string>>}
     */
    sign(transactionHash, chainId, role, index) {
        validateForSigning(transactionHash, chainId)

        const keys = this.getKeyByRole(role)

        if (index !== undefined) {
            validateIndexWithKeys(index, keys.length)
            return keys[index].sign(transactionHash, chainId)
        }

        const signatures = []
        for (const k of keys) {
            signatures.push(k.sign(transactionHash, chainId))
        }
        return signatures
    }

    /**
     * signs with hashed message and returns result object that includes `signatures`, `message` and `messageHash`
     *
     * @param {string} message The message string to sign.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used.
     * @return {object}
     */
    signMessage(message, role, index) {
        if (role === undefined) throw new Error(`role should be defined for signMessage. Please use 'caver.wallet.keyring.role'.`)
        const messageHash = utils.hashMessage(message)

        const keys = this.getKeyByRole(role)

        const signatures = []
        if (index !== undefined) {
            validateIndexWithKeys(index, keys.length)
            signatures.push(keys[index].signMessage(messageHash))
        } else {
            for (const k of keys) {
                signatures.push(k.signMessage(messageHash))
            }
        }
        return {
            messageHash,
            signatures,
            message,
        }
    }

    /**
     * returns keys by role.If the key of the role passed as parameter is empty, the default key is returned.
     *
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @return {Array.<PrivateKey>}
     */
    getKeyByRole(role) {
        if (role === undefined) throw new Error(`role should be defined.`)
        if (role >= KEY_ROLE.roleLast || role < 0) throw new Error(`Invalid role number: ${role}`)
        let key = this._keys[role]
        if (key.length === 0 && role > KEY_ROLE.roleTransactionKey) {
            if (this._keys[KEY_ROLE.roleTransactionKey].length === 0) {
                throw new Error(
                    `The key with ${KEY_ROLE[role]} role does not exist. The ${KEY_ROLE[0]} for the default role is also empty.`
                )
            }

            key = this._keys[KEY_ROLE.roleTransactionKey]
        }
        return key
    }

    /**
     * returns an instance of Account.
     *
     * @param {WeightedMultiSigOptions|Array.<WeightedMultiSigOptions>} [options] The options that includes 'threshold' and 'weight'. This is only necessary when keyring use multiple private keys.
     * @return {Account}
     */
    toAccount(options) {
        if (options !== undefined && !_.isArray(options))
            throw new Error(`options for an account should define threshold and weight for each roles in an array format`)

        const lengths = []
        for (const k of this.keys) lengths.push(k.length)
        options = fillWeightedMultiSigOptionsForRoleBased(lengths, options)

        const publicKeysByRole = this.getPublicKey()
        return Account.createWithAccountKeyRoleBased(this.address, publicKeysByRole, options)
    }

    /**
     * encrypts a keyring and returns a keystore v4 object.
     *
     * @param {string} password The password to be used for encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. Also address can be defined specifically in options object.
     * @return {object}
     */
    /**
     * options can include below
     * {
     *   salt: ...,
     *   iv: ...,
     *   kdf: ...,
     *   dklen: ...,
     *   c: ...,
     *   n: ...,
     *   r: ...,
     *   p: ...,
     *   cipher: ...,
     *   uuid: ...,
     *   cipher: ...,
     * }
     */
    encrypt(password, options = {}) {
        const keyring = []

        for (let i = KEY_ROLE.roleTransactionKey; i < KEY_ROLE.roleLast; i++) {
            const roledKey = this._keys[i]
            keyring.push(encryptKey(roledKey, password, options))
        }

        return formatEncrypted(4, this._address, keyring, options)
    }

    /**
     * returns KlaytnWalletKey format. If keyring uses more than one private key, this function will throw error.
     *
     * @return {string}
     */
    getKlaytnWalletKey() {
        throw new Error(`Not supported for this class.`)
    }

    /**
     * encrypts a keyring and returns a keystore v3 object.
     *
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    encryptV3(password, options) {
        throw new Error(`Not supported for this class. Use 'keyring.encrypt(password)'.`)
    }

    /**
     * returns true if keyring has decoupled key.
     *
     * @return {boolean}
     */
    isDecoupled() {
        return true
    }
}

module.exports = RoleBasedKeyring

/**
 * Format the key parameters passed by the user to create a keyring instance into a two-dimensional array containing PrivateKey instances.
 *
 * The cases of the parameter that the user passes to the function is as follows, and this function formats it as a two-dimensional array.
 * PrivateKey instance: PrivateKey{}
 * single private key string: `0x{private key}`
 * multiple private key strings: [`0x{private key}`, `0x{private key}`]
 * multiple PrivateKey instances: [PrivateKey{}, PrivateKey{}]
 * role-based private key strings: [[`0x{private key}`], [`0x{private key}`, `0x{private key}`], [`0x{private key}`]]
 * role-based PrivateKey instances: [[PrivateKey{}], [PrivateKey{}, PrivateKey{}], [PrivateKey{}]]
 *
 * @param {string|PrivateKey|Array.<string|PrivateKey>|Array.<Array.<string|PrivateKey>>} keyInput The input parameter for key variable in Keyring.
 * @return {Array.<Array.<PrivateKey>>}
 */
function formattingForKeyInKeyring(keyInput) {
    if (keyInput === null) {
        return keyInput
    }

    if (keyInput instanceof PrivateKey || _.isString(keyInput)) {
        keyInput = [[keyInput], [], []]
    } else if (isMultipleKeysFormat(keyInput)) {
        // [`0x{private key}`, `0x{private key}`, `0x{private key}`]
        keyInput = [keyInput, [], []]
    } else if (!isRoleBasedKeysFormat(keyInput)) {
        throw new Error(`Invalid format for key variable in keyring`)
    }

    const keys = generateKeysFormat()
    for (let i = 0; i < KEY_ROLE.roleLast; i++) {
        fillRoleKey(keys, i, keyInput[i])
    }

    return keys
}

function generateKeysFormat() {
    return Array(KEY_ROLE.roleLast)
        .fill(null)
        .map(() => [])
}

function fillRoleKey(keys, role, keyToAdd) {
    if (keyToAdd === undefined) return
    keyToAdd = Array.isArray(keyToAdd) ? keyToAdd : [keyToAdd]

    if (keyToAdd.length > MAXIMUM_KEY_NUM)
        throw new Error(`The maximum number of private keys that can be used in keyring is ${MAXIMUM_KEY_NUM}.`)
    if (role >= KEY_ROLE.roleLast)
        throw new Error(
            `Unsupported role number. The role number should be less than ${KEY_ROLE.roleLast}. Please use 'caver.wallet.keyring.role'`
        )

    for (const keyString of keyToAdd) {
        const key = keyString instanceof PrivateKey ? keyString : new PrivateKey(keyString)
        keys[role].push(key)
    }
}
