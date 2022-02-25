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
 * `SingleKeyring` is a class that stores the address of the account and a private key.
 *
 * To create a `SingleKeyring` instance with a private key string, please refer to {@link KeyringFactory.create|caver.wallet.keyring.create}.
 * SingleKeyring uses a private key with which no roles assigned.
 *
 * @class
 * @hideconstructor
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
     * Returns a public key string.
     *
     * @example
     * const publicKey = keyring.getPublicKey()
     *
     * @param {boolean} [compressed] Whether in compressed format or not.
     * @return {string} The public key of the keyring.
     */
    getPublicKey(compressed = false) {
        return this.key.getPublicKey(compressed)
    }

    /**
     * Returns a copied SingleKeyring instance.
     *
     * @example
     * const copied = keyring.copy()
     *
     * @return {SingleKeyring} A copied SingleKeyring instance.
     */
    copy() {
        return new SingleKeyring(this.address, this.key)
    }

    /**
     * Signs with transactionHash with the private key and returns signature.
     *
     * If you want to define an `index` when using SingleKeyring, the `index` must be `0`.
     * And `SingleKeyring` doesn't have a key defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so they all use the same private key.
     *
     * @example
     * const signed = keyring.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810', caver.wallet.keyring.role.roleTransactionKey)
     * const signed = keyring.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810', caver.wallet.keyring.role.roleAccountUpdateKey, 0)
     * const signed = keyring.sign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', '0x2810', caver.wallet.keyring.role.roleFeePayerKey)
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chain id of the Klaytn blockchain platform.
     * @param {number} role A number indicating the role of the key. You can use {@link KeyringFactory.role|caver.wallet.keyring.role}.
     * @param {number} [index] The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @return {SignatureData|Array.<SignatureData>} A {@link SignatureData} when `index` is deinfed, otherwise an array of {@link SignatureData}.
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
     * Signs with hashed data with the private key and returns signature which V is 0 or 1 (parity of the y-value of a secp256k1 signature).
     *
     * If you want to define an `index` when using SingleKeyring, the `index` must be `0`.
     * And `SingleKeyring` doesn't have a key defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so they all use the same private key.
     *
     * @example
     * const signed = keyring.ecsign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', caver.wallet.keyring.role.roleTransactionKey)
     * const signed = keyring.ecsign('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550', caver.wallet.keyring.role.roleAccountUpdateKey, 0)
     *
     * @param {string} hash The hashed data to sign.
     * @param {number} role A number indicating the role of the key. You can use {@link KeyringFactory.role|caver.wallet.keyring.role}.
     * @param {number} [index] The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @return {SignatureData|Array.<SignatureData>} A {@link SignatureData} when `index` is deinfed, otherwise an array of {@link SignatureData}.
     */
    ecsign(hash, role, index) {
        if (!utils.isValidHashStrict(hash)) throw new Error(`Invalid hash: ${hash}`)

        const key = this.getKeyByRole(role)

        if (index !== undefined) {
            validateIndexWithKeys(index, 1)
            return key.ecsign(hash)
        }

        return [key.ecsign(hash)]
    }

    /**
     * Signs message with Klaytn-specific prefix.
     *
     * This calculates a Klaytn-specific signature with:
     * `sign(keccak256("\x19Klaytn Signed Message:\n" + len(message) + message)))`.
     *
     * If you want to define an `index` when using SingleKeyring, the `index` must be `0`.
     * And `SingleKeyring` doesn't have a key defined by {@link KeyringFactory.role|caver.wallet.keyring.role}, so they all use the same private key.
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
        return this.key
    }

    /**
     * Returns the {@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format|KlaytnWalletKey} string for the keyring.
     *
     * @example
     * const klaytnWalletKey = keyring.getKlaytnWalletKey()
     *
     * @return {string}
     */
    getKlaytnWalletKey() {
        return `${this.key.privateKey}0x00${this.address}`
    }

    /**
     * Returns the {@link Account} instance for updating the {@link Account.AccountKey|AccountKey} of the Klaytn accounts.
     * The {@link Account} instance has an {@link Account.AccountKey|AccountKey} instance that can contain public key(s) inside, which will be sent to Klaytn Network and used for validating transactions.
     * Please note that if you update the AccountKey of the Account stored in the Klaytn, the old private key(s) cannot be used anymore.
     *
     * `SingleKeyring` returns an {@link Account} instance that includes the address in the keyring and an instance of {@link AccountKeyPublic}.
     *
     * @example
     * const account = keyring.toAccount()
     *
     * @return {Account} An Account instance to be used when a user updates AccountKey for their account in the Klaytn. Note that if you want to replace the existing keyring (or the existing private key) with a new keyring (or a new private key) for your account, you must update your AccountKey by sending an Account Update transaction to Klaytn beforehand.
     */
    toAccount() {
        if (!this.key) throw new Error(`Failed to create Account instance: Empty key in keyring.`)
        const publicKey = this.getPublicKey()
        return Account.createWithAccountKeyPublic(this.address, publicKey)
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
        keyring = encryptKey(this.key, password, options)
        return formatEncrypted(4, this.address, keyring, options)
    }

    /**
     * Encrypts an instance of {@link SingleKeyring} and returns a keystore v3 standard.
     *
     * @example
     * const encrypted = keyring.encryptV3('password')
     *
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} [options] The options to use when encrypt a keyring. See {@link SingleKeyring#encrypt|keyring.encrypt} for more detail about options.
     * @return {KeyringFactory.Keystore} The encrypted keystore v3.
     */
    encryptV3(password, options) {
        options = options || {}

        const crypto = encryptKey(this.key, password, options)[0]

        return formatEncrypted(3, this.address, crypto, options)
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
        return this.address.toLowerCase() !== this.key.getDerivedAddress().toLowerCase()
    }
}

module.exports = SingleKeyring
