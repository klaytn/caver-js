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
 * `RoleBasedKeyring` is a class that stores the address of the account and the private keys to be used for each role in the form of an array.
 *
 * `RoleBasedKeyring` defines keys which is implemented as a two-dimensional array (empty keys looks like `[ [], [], [] ]`) that can include multiple keys for each role.
 * The first array element defines the private key(s) for `roleTransactionKey`, the second defines private key(s) for `roleAccountUpdateKey`, and the third defines the private key(s) for `roleFeePayerKey`.
 *
 * @class
 * @hideconstructor
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
     * Returns public key strings for each roles.
     *
     * @example
     * const publicKeys = keyring.getPublicKey()
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {Array.<Array<string>>} The public keys of the keyring.
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
     * Returns a copied RoleBasedKeyring instance.
     *
     * @example
     * const copied = keyring.copy()
     *
     * @return {RoleBasedKeyring} A copied RoleBasedKeyring instance.
     */
    copy() {
        return new RoleBasedKeyring(this.address, this.keys)
    }

    /**
     * Signs with transactionHash with the private keys and returns signatures.
     *
     * If you want to define an `index` when using RoleBasedKeyring, the `index` must be less than the length of the specific role key.
     * And `RoleBasedKeyring` has the private key(s) defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so signs using the key(s) defined in the role.
     *
     * If the user has not defined an `index` parameter, `keyring.sign` signs transaction using all the private keys used by the role.
     * If `index` is defined, the `keyring.sign` signs transaction using only one private key at the index.
     * The role used in caver-js can be checked through {@link KeyringFactory.role|caver.wallet.keyring.role}.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId specific to the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. If index is undefined, all private keys in keyring will be used.
     * @return {SignatureData|Array.<SignatureData>} A {@link SignatureData} when `index` is deinfed, otherwise an array of {@link SignatureData}.
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
     * Signs with transactionHash with the private keys and returns signatures which V is 0 or 1 (parity of the y-value of a secp256k1 signature).
     *
     * If you want to define an `index` when using RoleBasedKeyring, the `index` must be less than the length of the specific role key.
     * And `RoleBasedKeyring` has the private key(s) defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so signs using the key(s) defined in the role.
     *
     * If the user has not defined an `index` parameter, `keyring.sign` signs transaction using all the private keys used by the role.
     * If `index` is defined, the `keyring.sign` signs transaction using only one private key at the index.
     * The role used in caver-js can be checked through {@link KeyringFactory.role|caver.wallet.keyring.role}.
     *
     * @example
     * const signed = keyring.ecsign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', caver.wallet.keyring.role.roleTransactionKey)
     * const signed = keyring.ecsign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', caver.wallet.keyring.role.roleAccountUpdateKey, 1)
     *
     * @param {string} hash The hashed data to sign.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. If index is undefined, all private keys in keyring will be used.
     * @return {SignatureData|Array.<SignatureData>} A {@link SignatureData} when `index` is deinfed, otherwise an array of {@link SignatureData}.
     */
    ecsign(hash, role, index) {
        if (!utils.isValidHashStrict(hash)) throw new Error(`Invalid hash: ${hash}`)

        const keys = this.getKeyByRole(role)

        if (index !== undefined) {
            validateIndexWithKeys(index, keys.length)
            return keys[index].ecsign(hash)
        }

        const signatures = []
        for (const k of keys) {
            signatures.push(k.ecsign(hash))
        }
        return signatures
    }

    /**
     * Signs message with Klaytn-specific prefix.
     *
     * This calculates a Klaytn-specific signature with:
     * `sign(keccak256("\x19Klaytn Signed Message:\n" + len(message) + message)))`.
     *
     * If you want to define an `index` when using RoleBasedKeyring, the `index` must be less than the length of the specific role key.
     * And `RoleBasedKeyring` has the private key(s) defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so signs using the key(s) defined in the role.
     *
     * If the user has not provided the `index` parameter, `caver.wallet.signMessage` signs message using all the private keys used by the role.
     * If the `index` parameter is given, `caver.wallet.signMessage` signs message using only one private key at the given index.
     * The role used in caver-js can be found from {@link KeyringFactory.role|caver.wallet.keyring.role}.
     *
     * @example
     * const signed = keyring.signMessage('message to sign', caver.wallet.keyring.role.roleTransactionKey)
     *
     * @param {string} message The message string to sign.
     * @param {number} role A number indicating the role of the key. You can use {@link KeyringFactory.role|caver.wallet.keyring.role}.
     * @param {number} [index] The index of the key to be used.
     * @return {KeyringContainer.SignedMessage} An object that includes the result of signing.
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
     * Returns the private key(s) used by the role entered as a parameter.
     *
     * @example
     * const key = keyring.getKeyByRole(caver.wallet.keyring.role.roleTransactionKey)
     *
     * @param {number} role A number indicating the role of the key. You can use {@link KeyringFactory.role|caver.wallet.keyring.role}.
     * @return {Array.<PrivateKey>} An instance of PrivateKey.
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
     * Returns the {@link Account} instance for updating the {@link Account.AccountKey|AccountKey} of the Klaytn accounts.
     * The {@link Account} instance has an {@link Account.AccountKey|AccountKey} instance that can contain public key(s) inside, which will be sent to Klaytn Network and used for validating transactions.
     * Please note that if you update the AccountKey of the Account stored in the Klaytn, the old private key(s) cannot be used anymore.
     *
     * `RoleBasedKeyring` returns an {@link Account} instance that includes the address in the keyring and an instance of {@link AccountKeyRoleBased}.
     *
     * @example
     * const account = keyring.toAccount()
     *
     * @param {Array.<WeightedMultiSigOptions>} [options] An array of the `WeightedMultiSigOptions` instances containing information that should be defined when updating your existing account to the one with a number of private keys. The `RoleBasedKeyring` uses different private keys for each role, a `WeightedMultiSigOptions` instance must be defined for each role in an array. If multiple keys are used and `options` are not defined for specific role, defualt WeightedMultiSigOptions (`{ threshold: 1, weights: [1, 1...}}`) is used.
     * @return {Account} An Account instance to be used when a user updates AccountKey for their account in the Klaytn. Note that if you want to replace the existing keyring (or the existing private key) with a new keyring (or a new private key) for your account, you must update your AccountKey by sending an Account Update transaction to Klaytn beforehand.
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
     * Encrypts a keyring and returns a keystore v4 standard.
     * For more information, please refer to {@link https://kips.klaytn.com/KIPs/kip-3|KIP-3}.
     *
     * `options` can include below:
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
     *
     * @example
     * const encrypted = keyring.encrypt('password')
     *
     * @param {string} password The password to be used for encryption. The encrypted key store can be decrypted with this password.
     * @param {object} [options] The options parameter allows you to specify the values to use when using encrypt.
     * @return {KeyringFactory.Keystore} The encrypted keystore v4.
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
     * Returns the {@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format|KlaytnWalletKey} string for the keyring.
     * This function will throw error because `MultipleKeyring` uses more than one private key.
     *
     * @example
     * const klaytnWalletKey = keyring.getKlaytnWalletKey()
     *
     * @ignore
     * @return {string}
     */
    getKlaytnWalletKey() {
        throw new Error(`Not supported for this class.`)
    }

    /**
     * Encrypts a keyring and returns a keystore v3 object.
     *
     * Note that {@link MultipleKeyring} and {@link RoleBasedKeyring} cannot use encryptV3.
     * In this case, please use {@link MultipleKeyring#encrypt|keyring.encrypt} with a keystore V4 standard.
     *
     * @example
     * const encrypted = keyring.encryptV3('password')
     *
     * @ignore
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} [options] The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    encryptV3(password, options) {
        throw new Error(`Not supported for this class. Use 'keyring.encrypt(password)'.`)
    }

    /**
     * Returns `true` if keyring has decoupled key.
     *
     * @example
     * const isDecupled = keyring.isDecoupled()
     *
     * @return {boolean} `true` if keyring has decoupled key.
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
