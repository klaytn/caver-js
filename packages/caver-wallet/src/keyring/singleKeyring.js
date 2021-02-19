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

const utils = require('../../../caver-utils')
const PrivateKey = require('./privateKey')
const { KEY_ROLE } = require('./keyringHelper')
const Account = require('../../../caver-account')
const { validateForSigning, validateIndexWithKeys, encryptKey, formatEncrypted } = require('./keyringHelper')

/**
 * representing a Keyring which includes `address` and a `private key`.
 * @class
 */
class SingleKeyring {
    /**
     * creates a SingleKeyring.
     * @param {string} address - The address of keyring.
     * @param {string|PrivateKey} key - The key to use in SingleKeyring.
     */
    constructor(address, key) {
        this.address = address
        this.key = key
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
     * @type {PrivateKey}
     */
    get key() {
        return this._key
    }

    set key(keyInput) {
        if (keyInput === null) {
            this._key = null
            return
        }
        this._key = keyInput instanceof PrivateKey ? keyInput : new PrivateKey(keyInput)
    }

    /**
     * returns public key string.
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {string}
     */
    getPublicKey(compressed = false) {
        return this.key.getPublicKey(compressed)
    }

    /**
     * returns a copied singleKeyring instance
     *
     * @return {SingleKeyring}
     */
    copy() {
        return new SingleKeyring(this.address, this.key)
    }

    /**
     * signs with transactionHash with a key and returns signature(s).
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId specific to the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. If index is undefined, all private keys in keyring will be used.
     * @return {Array.<string>|Array.<Array.<string>>}
     */
    sign(transactionHash, chainId, role, index) {
        validateForSigning(transactionHash, chainId)

        const key = this.getKeyByRole(role)

        if (index !== undefined) {
            validateIndexWithKeys(index, 1)
            return key.sign(transactionHash, chainId)
        }

        return [key.sign(transactionHash, chainId)]
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

        const key = this.getKeyByRole(role)
        const signatures = []
        if (index !== undefined) {
            validateIndexWithKeys(index, 1)
        }

        signatures.push(key.signMessage(messageHash))
        return {
            messageHash,
            signatures,
            message,
        }
    }

    /**
     * returns keys by role. If the key of the role passed as parameter is empty, the default key is returned.
     *
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @return {Array.<PrivateKey>}
     */
    getKeyByRole(role) {
        if (role === undefined) throw new Error(`role should be defined.`)
        if (role >= KEY_ROLE.roleLast || role < 0) throw new Error(`Invalid role number: ${role}`)
        return this.key
    }

    /**
     * returns KlaytnWalletKey format. If keyring uses more than one private key, this function will throw error.
     *
     * @return {string}
     */
    getKlaytnWalletKey() {
        return `${this.key.privateKey}0x00${this.address}`
    }

    /**
     * returns an instance of Account.
     *
     * @return {Account}
     */
    toAccount() {
        if (!this.key) throw new Error(`Failed to create Account instance: Empty key in keyring.`)
        const publicKey = this.getPublicKey()
        return Account.createWithAccountKeyPublic(this.address, publicKey)
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
        let keyring = []
        keyring = encryptKey(this.key, password, options)
        return formatEncrypted(4, this.address, keyring, options)
    }

    /**
     * encrypts a keyring and returns a keystore v3 object.
     *
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    encryptV3(password, options) {
        options = options || {}

        const crypto = encryptKey(this.key, password, options)[0]

        return formatEncrypted(3, this.address, crypto, options)
    }

    /**
     * returns true if keyring has decoupled key.
     *
     * @return {boolean}
     */
    isDecoupled() {
        return this.address.toLowerCase() !== this.key.getDerivedAddress().toLowerCase()
    }
}

module.exports = SingleKeyring
