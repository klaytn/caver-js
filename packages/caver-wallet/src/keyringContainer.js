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
const Keyring = require('./keyring/keyring')
const TransactionHasher = require('../../caver-transaction/src/transactionHasher/transactionHasher')
const { KEY_ROLE } = require('./keyring/keyringHelper')
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
        this._length = 0
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
        return this._length
    }

    /**
     * generates keyrings in the keyringContainer with randomly generated key pairs.
     *
     * @param {number} numberOfKeyrings The number of accounts to create.
     * @param {string} [entropy] A random string to increase entropy. If undefined, a random string will be generated using randomHex.
     * @return {KeyringContainer}
     */
    generate(numberOfKeyrings, entropy) {
        for (let i = 0; i < numberOfKeyrings; ++i) {
            this.add(Keyring.generate(entropy))
        }
        return this
    }

    /**
     * creates a keyring instance with given parameters and adds it to the keyringContainer.
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

        if (!(keyring instanceof Keyring)) throw new Error(`Unsupported type : ${typeof key}`)

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

        founded.key = keyring.copy().key
        return founded
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

        this._length++
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

        keyringToRemove.key = null
        this._addressKeyringMap.delete(keyringToRemove.address.toLowerCase())

        this._length--

        return true
    }

    /**
     * signs with data and returns the result object that includes `signature`, `message` and `messageHash`
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {string} data The data string to sign.
     * @param {number} [role] A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
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
     * @param {number} [index] An index of key to use for signing.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {string}
     */
    async signWithKey(address, transaction, index, hasher) {
        if (!transaction.from || transaction.from === '0x') transaction.from = address
        if (transaction.from.toLowerCase() !== address.toLowerCase())
            throw new Error(`transaction.from ${transaction.from.toLowerCase()} is different from the given address ${address.toLowerCase()}.`)

        // Optional parameter processing
        // (address transaction) / (address transaction index) / (address transaction hasher) / (address transaction index hasher)
        if (_.isFunction(index) && hasher === undefined) {
            hasher = index
            index = 0
        }
        if (index === undefined) index = 0
        if (!_.isNumber(index)) throw new Error(`Invalid index type: ${typeof index}`)
        if (hasher === undefined) hasher = TransactionHasher.getHashForSigning

        await transaction.fillTransaction()
        const hash = hasher(transaction)
        const role = transaction.type.includes('ACCOUNT_UPDATE') ? KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY : KEY_ROLE.ROLE_TRANSACTION_KEY

        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const sig = keyring.signWithKey(hash, transaction.chainId, role, index)

        transaction.appendSignatures(sig)

        return hash
    }

    /**
     * signs the transaction using keys and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {string}
     */
    async signWithKeys(address, transaction, hasher = TransactionHasher.getHashForSigning) {
        if (!transaction.from || transaction.from === '0x') transaction.from = address
        if (transaction.from.toLowerCase() !== address.toLowerCase())
            throw new Error(`transaction.from ${transaction.from.toLowerCase()} is different from the given address ${address.toLowerCase()}.`)

        await transaction.fillTransaction()
        const hash = hasher(transaction)
        const role = transaction.type.includes('ACCOUNT_UPDATE') ? KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY : KEY_ROLE.ROLE_TRANSACTION_KEY

        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find the keyring from the wallet with the given address: ${address}`)
        const sigs = keyring.signWithKeys(hash, transaction.chainId, role)

        transaction.appendSignatures(sigs)

        return hash
    }

    /**
     * signs the transaction as a fee payer using one key and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object. This should be `FEE_DELEGATED` type.
     * @param {number} [index] An index of key to use for signing.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {string}
     */
    async signFeePayerWithKey(address, transaction, index, hasher) {
        // Optional parameter processing
        // (address transaction) / (address transaction index) / (address transaction hasher) / (address transaction index hasher)
        if (_.isFunction(index) && hasher === undefined) {
            hasher = index
            index = 0
        }
        if (index === undefined) index = 0
        if (!_.isNumber(index)) throw new Error(`Invalid index type: ${typeof index}`)
        if (hasher === undefined) hasher = TransactionHasher.getHashForFeePayerSigning

        if (!transaction.feePayer || transaction.feePayer === '0x') transaction.feePayer = address

        await transaction.fillTransaction()
        const hash = hasher(transaction)

        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const sig = keyring.signWithKey(hash, transaction.chainId, KEY_ROLE.ROLE_FEE_PAYER_KEY, index)

        transaction.appendFeePayerSignatures(sig)

        return hash
    }

    /**
     * signs the transaction as a fee payer using keys and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object. This should be `FEE_DELEGATED` type.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {string}
     */
    async signFeePayerWithKeys(address, transaction, hasher = TransactionHasher.getHashForFeePayerSigning) {
        if (!transaction.feePayer || transaction.feePayer === '0x') transaction.feePayer = address

        await transaction.fillTransaction()
        const hash = hasher(transaction)

        const keyring = this.getKeyring(address)
        if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
        const sigs = keyring.signWithKeys(hash, transaction.chainId, KEY_ROLE.ROLE_FEE_PAYER_KEY)

        transaction.appendFeePayerSignatures(sigs)

        return hash
    }
}

module.exports = KeyringContainer
