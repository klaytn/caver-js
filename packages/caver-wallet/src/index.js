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
const Keyring = require('./keyring/keyringFactory')
const SingleKeyring = require('./keyring/singleKeyring')
const MultipleKeyring = require('./keyring/multipleKeyring')
const RoleBasedKeyring = require('./keyring/roleBasedKeyring')
const utils = require('../../caver-utils/src')

/**
 * @typedef {SingleKeyring|MultipleKeyring|RoleBasedKeyring} KeyringContainer.Keyring
 */

/**
 * representing a Keyring container which manages keyrings.
 *
 * @class
 * @hideconstructor
 */
class KeyringContainer {
    /**
     * Creates a keyringContainer.
     * @param {Array.<KeyringContainer.Keyring>} keyrings - The keyrings to be managed in KeyringContainer.
     */
    constructor(keyrings) {
        keyrings = keyrings || []
        this._addressKeyringMap = new Map()

        // add keyrings to keyringContainer
        for (const keyring of keyrings) {
            this.add(keyring)
        }

        /** @type {KeyringFactory} */
        this.keyring = Keyring
    }

    /**
     * @type {number}
     */
    get length() {
        return this._addressKeyringMap.size
    }

    /**
     * Generates instances of {@link SingleKeyring} in the keyringContainer with randomly generated private keys.
     *
     * @example
     * // without entropy
     * const generated = caver.wallet.generate(3)
     * // with entropy
     * const generated = caver.wallet.generate(3, caver.utils.randomHex(32))
     *
     * @param {number} numberOfKeyrings The number of keyrings to create.
     * @param {string} [entropy] A random string to increase entropy. If undefined, a random string will be generated using randomHex.
     * @return {Array.<string>} An array containing the addresses of the generated.
     */
    generate(numberOfKeyrings, entropy) {
        const addresses = []
        for (let i = 0; i < numberOfKeyrings; ++i) {
            addresses.push(this.add(Keyring.generate(entropy)).address)
        }
        return addresses
    }

    /**
     * Creates a keyring instance with given parameters and adds it to the `caver.wallet`.
     * KeyringContainer manages the Keyring instances using Map<string:{@link KeyringContainer.Keyring|Keyring}> which has address as key value.
     *
     * If `key` is a private key string, a {@link SingleKeyring} instance that uses a single private key is created.
     * If `key` is an array containing private key strings, a {@link MultipleKeyring} instance that use multiple private keys is created.
     * If `key` is a 2D array of which each element contains the private key(s) to be used for each role, a {@link RoleBasedKeyring} instance is created.
     * The keyring created is added to `caver.wallet`.
     *
     * @example
     * // Create a instance of SingleKeyring and add to caver.wallet
     * const singleKeyring = caver.wallet.newKeyring('0x{address in hex}', '0x{private key}')
     *
     * // Create a instance of MultipleKeyring and add to caver.wallet
     * const multipleKeyring = caver.wallet.newKeyring('0x{address in hex}', ['0x{private key1}', '0x{private key2}'])
     *
     * // Create a instance of RoleBasedKeyring and add to caver.wallet
     * const roleBasedKeys = [
     *     ['0x{private key1}', '0x{private key2}'],
     *     ['0x{private key3}', '0x{private key4}'],
     *     ['0x{private key5}', '0x{private key6}'],
     * ]
     * const roleBasedKeyring = caver.wallet.newKeyring('0x{address in hex}', roleBasedKeys)
     *
     * @param {string} address The address of the keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key The private key string, an array of private keys, or a 2D array of which each array element contains keys defined for each role.
     * @return {KeyringContainer.Keyring} The keyring instance ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) added to `caver.wallet` is returned.
     */
    newKeyring(address, key) {
        // The format of key parameter can be
        // 1. single private key string   => `0x{private key}`
        // 2. multiple private key string =>[`0x{private key}`, `0x{private key}`, ...]
        // 3. role based private keys     => [[`0x{private key}`, `0x{private key}`, ...], [], [`0x{private key}`]]

        let keyring

        if (_.isString(key)) keyring = Keyring.createWithSingleKey(address, key)

        if (_.isArray(key)) {
            if (key.length === 0) throw new Error(`Insufficient private key information: Empty array`)
            if (_.isArray(key[0])) {
                keyring = Keyring.createWithRoleBasedKey(address, key)
            } else {
                keyring = Keyring.createWithMultipleKey(address, key)
            }
        }

        if (!(keyring instanceof SingleKeyring) && !(keyring instanceof MultipleKeyring) && !(keyring instanceof RoleBasedKeyring))
            throw new Error(`Unsupported type value: ${key} (type:${typeof key})`)

        return this.add(keyring)
    }

    /**
     * Updates the keyring inside the `caver.wallet`.
     * When a new `keyring` instance ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) is passed as a parameter, the existing keyring stored in the `caver.wallet` that matches the `address` property of the given `keyring` instance is found and replaced with the given one.
     * An error occurs when the matching `keyring` is not found.
     *
     * @example
     * const updated = caver.wallet.updateKeyring(newKeyring)
     *
     * @param {KeyringContainer.Keyring} keyring The new keyring ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) to be stored in `caver.wallet`.
     * @return {KeyringContainer.Keyring} The updated keyring ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) stored in `caver.wallet`.
     */
    updateKeyring(keyring) {
        const founded = this._addressKeyringMap.get(keyring.address.toLowerCase())
        if (founded === undefined) throw new Error(`Failed to find keyring to update`)

        this.remove(founded.address)
        this.add(keyring)

        return keyring
    }

    /**
     * Returns the keyring instance corresponding to the address in `caver.wallet`.
     * If it fails to find a keyring that maps to the address, it returns `undefined`.
     *
     * @example
     * const keyring = caver.wallet.getKeyring('0x{address in hex}')
     *
     * @param {string} address The address of keyring to query.
     * @return {KeyringContainer.Keyring} The found keyring instance ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) stored in caver.wallet.
     */
    getKeyring(address) {
        if (!utils.isAddress(address))
            throw new Error(
                `Invalid address ${address}. To get keyring from wallet, you need to pass a valid address string as a parameter.`
            )

        const founded = this._addressKeyringMap.get(address.toLowerCase())

        return founded
    }

    /**
     * Returns `true` if there is a keyring matching the address.
     *
     * @example
     * const isExisted = caver.wallet.isExisted('0x{address in hex}')
     *
     * @param {string} address The address of keyring to check existence.
     * @return {boolean} `true` means a keyring matching with the address is existed in the `caver.wallet`.
     */
    isExisted(address) {
        return this.getKeyring(address) !== undefined
    }

    /**
     * Adds an instance of `keyring` to the `caver.wallet`.
     * If the newly given `keyring` has the same address with one of the keyrings that already exist in `caver.wallet`, an error is returned.
     * In this case, use {@link KeyringContainer#updateKeyring|updateKeyring} to update the existing keyring in `caver.wallet`.
     *
     * @example
     * const added = caver.wallet.add(keyring)
     *
     * @param {KeyringContainer.Keyring} keyring A keyring instance ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) to add to `caver.wallet`.
     * @return {KeyringContainer.Keyring} The added keyring ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) in `caver.wallet`.
     */
    add(keyring) {
        if (this._addressKeyringMap.get(keyring.address.toLowerCase()) !== undefined)
            throw new Error(`Duplicate Account ${keyring.address}. Please use updateKeyring() instead.`)

        const keyringToAdd = keyring.copy()

        this._addressKeyringMap.set(keyringToAdd.address.toLowerCase(), keyringToAdd)

        return keyringToAdd
    }

    /**
     * Deletes the keyring from `caver.wallet` whose address matches the address of the given keyring.
     *
     * @example
     * const isDeleted = caver.wallet.remove('0x{address in hex}')
     *
     * @param {string} address An address of the keyring to be deleted in `caver.wallet`.
     * @return {boolean} `true` if keyring is removed from `caver.wallet`.
     */
    remove(address) {
        let keyringToRemove
        if (utils.isAddress(address)) {
            keyringToRemove = this.getKeyring(address)
        } else {
            throw new Error(`To remove the keyring, the first parameter should be an address string.`)
        }

        if (keyringToRemove === undefined) return false

        // deallocate keyring object created for keyringContainer
        keyringToRemove.keys = null
        this._addressKeyringMap.delete(keyringToRemove.address.toLowerCase())

        return true
    }

    /**
     * An object that includes signed message.
     *
     * @typedef {object} KeyringContainer.SignedMessage
     * @property {string} messageHash - The hash of message with Klaytn-specific prefix.
     * @property {Array.<SignatureData>} signatures - An array of {@link SignatureData}.
     * @property {string} message - The message to sign.
     */
    /**
     * Signs the message with Klaytn-specific prefix using keyring stored in `caver.wallet`.
     *
     * This calculates a Klaytn-specific signature with:
     * `sign(keccak256("\x19Klaytn Signed Message:\n" + len(message) + message)))`.
     *
     * If the user has not provided the `index` parameter, `caver.wallet.signMessage` signs message using all the private keys used by the role.
     * If the `index` parameter is given, `caver.wallet.signMessage` signs message using only one private key at the given index.
     * The role used in caver-js can be found from {@link KeyringFactory.role|caver.wallet.keyring.role}.
     *
     * @example
     * const result = caver.wallet.signMessage('0x{address in hex}', 'message to sign', caver.wallet.keyring.role.roleTransactionKey)
     * const result = caver.wallet.signMessage('0x{address in hex}', 'message to sign', caver.wallet.keyring.role.roleTransactionKey, 0)
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {string} message The message to sign.
     * @param {number} role A number indicating the role of the key. You can use {@link KeyringFactory.role|caver.wallet.keyring.role}.
     * @param {number} [index] The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @return {KeyringContainer.SignedMessage} An object that includes the result of signing.
     */
    signMessage(address, message, role, index) {
        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        return keyring.signMessage(message, role, index)
    }

    /**
     * Signs the transaction as a `sender` of the transaction and appends `signatures` in the transaction object using the keyring in `caver.wallet`.
     *
     * For {@link AccountUpdate|Account Update} transaction, use "roleAccountUpdateKey", or otherwise, use "roleTransactionKey" in {@link RoleBasedKeyring}.
     * If the user has not defined an `index`, `transaction.sign` signs the transaction using "all the private keys" used by the role.
     * If `index` is defined, the `transaction.sign` signs the transaction using "only one private key" at the given index.
     *
     * @example
     * const signed = await caver.wallet.sign('0x{address in hex}', transaction)
     * const signed = await caver.wallet.sign('0x{address in hex}', transaction, 0)
     *
     * @param {string} address An address of the keyring to be used.
     * @param {module:Transaction.Transaction} transaction An instance of {@link module:Transaction.Transaction|Transaction}.
     * @param {number} [index] The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @param {function} [hasher] A hash function to get the transaction hash. If hasher is given as a parameter, it calculates the transaction hash instead of the default method for calculating transaction hash implemented in caver-js. See {@link https://docs.klaytn.com/klaytn/design/transactions/basic|Klaytn Docs} for details about the default method for transaction hash generation.
     * @return {Promise<module:Transaction.Transaction>} The signed transaction.
     */
    async sign(address, transaction, index, hasher) {
        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const signed = await transaction.sign(keyring, index, hasher)

        return signed
    }

    /**
     * Signs the transaction as fee payer of the transaction and appends `feePayerSignatures` in the transaction object using the keyring in `caver.wallet`.
     *
     * This will use "roleFeePayerKey" in {@link RoleBasedKeyring}.
     * If the user has not defined an `index`, `transaction.signAsFeePayer` signs the transaction using "all the private keys" used by the role.
     * If `index` is defined, the `transaction.signAsFeePayer` signs the transaction using "only one private key" at the given index.
     *
     * If the `transaction.feePayer` is not defined, the address of keyring which is founded from `caver.wallet` is assigned.
     *
     * @example
     * const signed = await caver.wallet.signAsFeePayer('0x{address in hex}', transaction)
     * const signed = await caver.wallet.signAsFeePayer('0x{address in hex}', transaction, 0)
     *
     * @param {string} address An address of the keyring to be used.
     * @param {module:Transaction.FeeDelegatedTransaction} transaction An instance of {@link module:Transaction.FeeDelegatedTransaction|FeeDelegatedTransaction}.
     * @param {number} [index] The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @param {function} [hasher] A function to get the transaction hash. If hasher is defined as a parameter, this is used to get the transaction hash instead of a default implementation in caver-js.
     * @return {Promise<module:Transaction.FeeDelegatedTransaction>} The fee payer signed transaction.
     */
    async signAsFeePayer(address, transaction, index, hasher) {
        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const signed = await transaction.signAsFeePayer(keyring, index, hasher)

        return signed
    }
}

module.exports = KeyringContainer
