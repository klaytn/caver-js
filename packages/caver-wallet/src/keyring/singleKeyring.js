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

const AbstractKeyring = require('./abstractKeyring')
const utils = require('../../../caver-utils')
const PrivateKey = require('./privateKey')
const { KEY_ROLE } = require('./keyringHelper')
const Account = require('../../../caver-account')
const { validateForSigning, validateIndexWithKeys, encryptKey, formatEncrypted } = require('./keyringHelper')

/**
 * representing a Keyring which includes `address` and `private key`.
 * @class
 */
class SingleKeyring extends AbstractKeyring {
    /**
     * creates a keyring.
     * @param {string} address - The address of keyring.
     * @param {string|PrivateKey} key - The key to use in SingleKeyring.
     */
    constructor(address, key) {
        super(address)
        this.key = key
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
     * @return {string}
     */
    getPublicKey() {
        return this.key.getPublicKey()
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
     * signs with transactionHash with key and returns signature.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId specific to the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. (default: 0)
     * @return {Array<string>}
     */
    signWithKey(transactionHash, chainId, role, index = 0) {
        validateForSigning(transactionHash, chainId)
        if (role === undefined) throw new Error(`role should be defined to sign.`)

        const key = this.getKeyByRole(role)
        validateIndexWithKeys(index, 1)
        return key.sign(transactionHash, chainId)
    }

    /**
     * signs with transactionHash with multiple keys and returns signatures.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId the chain id specific to the network
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @return {Array.<Array<string>>}
     */
    signWithKeys(transactionHash, chainId, role) {
        return [this.signWithKey(transactionHash, chainId, role)]
    }

    /**
     * signs with hashed message and returns result object that includes `signature`, `message` and `messageHash`
     *
     * @param {string} message The message string to sign.
     * @param {number} [role] A number indicating the role of the key. You can use `caver.wallet.keyring.role`. (default: `caver.wallet.keyring.role.roleTransactionKey`)
     * @param {number} [index] The index of the key to be used. (default: 0)
     * @return {object}
     */
    signMessage(message, role, index) {
        const messageHash = utils.hashMessage(message)
        if (role === undefined && index === undefined) {
            role = KEY_ROLE.roleTransactionKey
            index = 0
        } else if (role === undefined || index === undefined) {
            throw new Error(
                `To sign the given message, both role and index must be defined. ` +
                    `If both role and index are not defined, this function signs the message using the default key(${KEY_ROLE[0]}[0]).`
            )
        }

        const key = this.getKeyByRole(role)
        validateIndexWithKeys(index, 1)

        const signature = key.signMessage(messageHash)
        return {
            messageHash,
            signature,
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
        if (role >= KEY_ROLE.roleLast) throw new Error(`Invalid role number: ${role}`)
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
    toAccount(options) {
        if (options) throw new Error(`options cannot be defined with single key.`)
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
