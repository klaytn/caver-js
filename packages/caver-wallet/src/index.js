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
const AbstractKeyring = require('./keyring/abstractKeyring')
const utils = require('../../caver-utils/src')

/**
 * representing a Keyring container which manages keyrings.
 * @class
 */
class KeyringContainer {
    /**
     * creates a keyringContainer.
     * @param {Array.<Keyring>} keyrings - The keyrings to be managed in KeyringContainer.
     */
    constructor(keyrings) {
        keyrings = keyrings || []
        this._addressKeyringMap = new Map()

        // add keyrings to keyringContainer
        for (const keyring of keyrings) {
            this.add(keyring)
        }
    }

    /**
     * @type {number}
     */
    get length() {
        return this._addressKeyringMap.size
    }

    /**
     * generates keyrings in the keyringContainer with randomly generated key pairs.
     *
     * @param {number} numberOfKeyrings The number of keyrings to create.
     * @param {string} [entropy] A random string to increase entropy. If undefined, a random string will be generated using randomHex.
     * @return {Array.<string>}
     */
    generate(numberOfKeyrings, entropy) {
        const addresses = []
        for (let i = 0; i < numberOfKeyrings; ++i) {
            addresses.push(this.add(Keyring.generate(entropy)).address)
        }
        return addresses
    }

    /**
     * creates a keyring instance with given parameters and adds it to the keyringContainer.
     * KeyringContainer manages Keyring instance using Map <string:Keyring> which has address as key value.
     *
     * @param {string} address The address of the keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key Private key string(s) to use in keyring. If different keys are used for each role, key must be defined as a two-dimensional array.
     * @return {Keyring}
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

        if (!(keyring instanceof AbstractKeyring)) throw new Error(`Unsupported type value: ${key} (type:${typeof key})`)

        return this.add(keyring)
    }

    /**
     * updates the keyring inside the keyringContainer.
     * Query the keyring to be updated from keyringContainer with the keyring's address,
     * and an error occurs when the keyring is not found in the keyringContainer.
     *
     * @param {Keyring} keyring The keyring with new key.
     * @return {Keyring}
     */
    updateKeyring(keyring) {
        const founded = this._addressKeyringMap.get(keyring.address.toLowerCase())
        if (founded === undefined) throw new Error(`Failed to find keyring to update`)

        this.remove(founded.address)
        this.add(keyring)

        return keyring
    }

    /**
     * Get the keyring in container corresponding to the address
     *
     * @param {string} address The address of keyring to query.
     * @return {Keyring}
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
     * adds a keyring to the keyringContainer.
     *
     * @param {Keyring} keyring A keyring instance to add to keyringContainer.
     * @return {Keyring}
     */
    add(keyring) {
        if (this._addressKeyringMap.get(keyring.address.toLowerCase()) !== undefined)
            throw new Error(`Duplicate Account ${keyring.address}. Please use updateKeyring() instead.`)

        const keyringToAdd = keyring.copy()

        this._addressKeyringMap.set(keyringToAdd.address.toLowerCase(), keyringToAdd)

        return keyringToAdd
    }

    /**
     * deletes the keyring that associates with the given address from keyringContainer.
     *
     * @param {string} address An address of the keyring to be deleted in keyringContainer.
     * @return {boolean}
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
     * signs with data and returns the result object that includes `signature`, `message` and `messageHash`
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {string} data The data string to sign.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] An index of key to use for signing.
     * @return {object}
     */
    signMessage(address, data, role, index) {
        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        return keyring.signMessage(data, role, index)
    }

    /**
     * signs the transaction using one key and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object.
     * @param {number} [index] An index of key to use for signing. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {Transaction}
     */
    async sign(address, transaction, index, hasher) {
        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const signed = await transaction.sign(keyring, index, hasher)

        return signed
    }

    /**
     * signs the transaction as a fee payer using one key and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object. This should be `FEE_DELEGATED` type.
     * @param {number} [index] An index of key to use for signing. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {Transaction}
     */
    async signAsFeePayer(address, transaction, index, hasher) {
        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const signed = await transaction.signAsFeePayer(keyring, index, hasher)

        return signed
    }
}

module.exports = KeyringContainer
