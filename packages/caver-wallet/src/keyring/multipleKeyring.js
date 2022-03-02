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
const { KEY_ROLE } = require('./keyringHelper')
const Account = require('../../../caver-account')
const { fillWeightedMultiSigOptionsForMultiSig } = require('../../../caver-account/src/accountKey/accountKeyHelper')
const { validateForSigning, validateIndexWithKeys, encryptKey, formatEncrypted } = require('./keyringHelper')

/**
 * `MultipleKeyring` is a class that stores the address of the account and the multiple private keys.
 *
 * To create a `MultipleKeyring` instance with private key strings, please refer to {@link KeyringFactory.create|caver.wallet.keyring.create}.
 * MultipleKeyring uses private keys with which no roles assigned.
 *
 * @class
 * @hideconstructor
 */
class MultipleKeyring {
    /**
     * creates a MultipleKeyring.
     * @param {string} address - The address of keyring.
     * @param {Array.<string>|Array.<PrivateKey>} keys - The keys to use in MultipleKeyring.
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
     * @type {Array.<PrivateKey>}
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
     * Returns public key strings.
     *
     * @example
     * const publicKeys = keyring.getPublicKey()
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {Array.<string>} The public keys of the keyring.
     */
    getPublicKey(compressed = false) {
        const publicKeys = []
        for (let i = 0; i < this.keys.length; i++) {
            publicKeys.push(this.keys[i].getPublicKey(compressed))
        }
        return publicKeys
    }

    /**
     * Returns a copied MultipleKeyring instance.
     *
     * @example
     * const copied = keyring.copy()
     *
     * @return {MultipleKeyring} A copied MultipleKeyring instance.
     */
    copy() {
        return new MultipleKeyring(this.address, this.keys)
    }

    /**
     * Signs with transactionHash with the private keys and returns signatures.
     *
     * If you want to define an `index` when using MultipleKeyring, the `index` must be less than the length of the key.
     * And `MultipleKeyring` doesn't have the private key(s) defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so they all use the same private keys.
     *
     * If the user has not defined an `index` parameter, `keyring.sign` signs transaction using all the private keys used by the role.
     * If `index` is defined, the `keyring.sign` signs transaction using only one private key at the index.
     * The role used in caver-js can be checked through {@link KeyringFactory.role|caver.wallet.keyring.role}.
     *
     * @example
     * const signed = keyring.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810', caver.wallet.keyring.role.roleTransactionKey)
     * const signed = keyring.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810', caver.wallet.keyring.role.roleAccountUpdateKey, 1)
     * const signed = keyring.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810', caver.wallet.keyring.role.roleFeePayerKey)
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
     * Signs with hashed data with the private keys and returns signatures which V is 0 or 1 (parity of the y-value of a secp256k1 signature).
     *
     * If you want to define an `index` when using MultipleKeyring, the `index` must be less than the length of the key.
     * And `MultipleKeyring` doesn't have the private key(s) defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so they all use the same private keys.
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
     * If you want to define an `index` when using MultipleKeyring, the `index` must be less than the length of the key.
     * And `MultipleKeyring` doesn't have the private key(s) defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so they all use the same private keys.
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
     * @param {number} [index] The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
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
        return this.keys
    }

    /**
     * Returns the {@link Account} instance for updating the {@link Account.AccountKey|AccountKey} of the Klaytn accounts.
     * The {@link Account} instance has an {@link Account.AccountKey|AccountKey} instance that can contain public key(s) inside, which will be sent to Klaytn Network and used for validating transactions.
     * Please note that if you update the AccountKey of the Account stored in the Klaytn, the old private key(s) cannot be used anymore.
     *
     * `MultipleKeyring` returns an {@link Account} instance that includes the address in the keyring and an instance of {@link AccountKeyWeightedMultiSig}.
     *
     * @example
     * const account = keyring.toAccount()
     *
     * @param {WeightedMultiSigOptions} [options] `WeightedMultiSigOptions` instance containing information that should be defined when updating your existing account to the one with a number of private keys. If `options` parameter is not defined, the default `WeightedMultiSigOptions` with the `{ threshold: 1, weights: [1, 1...}}` will be used.
     * @return {Account} An Account instance to be used when a user updates AccountKey for their account in the Klaytn. Note that if you want to replace the existing keyring (or the existing private key) with a new keyring (or a new private key) for your account, you must update your AccountKey by sending an Account Update transaction to Klaytn beforehand.
     */
    toAccount(options) {
        if (_.isArray(options))
            throw new Error(`For AccountKeyWeightedMultiSig, options cannot be defined as an array of WeightedMultiSigOptions.`)

        options = fillWeightedMultiSigOptionsForMultiSig(this.keys.length, options)

        const publicKeys = this.getPublicKey()
        return Account.createWithAccountKeyWeightedMultiSig(this.address, publicKeys, options)
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
        let keyring = []
        keyring = encryptKey(this.keys, password, options)
        return formatEncrypted(4, this.address, keyring, options)
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

module.exports = MultipleKeyring

/**
 * Format the key parameters passed by the user to create a keyring instance.
 * @param {Array.<string|PrivateKey>} keyInput The input parameter for key variable in Keyring.
 * @return {Array.<PrivateKey>}
 */
function formattingForKeyInKeyring(keyInput) {
    if (!_.isArray(keyInput)) {
        throw new Error(`Invalid parameter. The private keys to add should be defined as an array.`)
    }

    const keys = []
    for (let i = 0; i < keyInput.length; i++) {
        keys.push(keyInput[i] instanceof PrivateKey ? keyInput[i] : new PrivateKey(keyInput[i]))
    }

    return keys
}
