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
const scrypt = require('scrypt-shim')
const uuid = require('uuid')
const cryp = typeof global === 'undefined' ? require('crypto-browserify') : require('crypto')
const AccountLib = require('eth-lib/lib/account')

const utils = require('../../../caver-utils')
const PrivateKey = require('./privateKey')
const { KEY_ROLE } = require('./keyringHelper')
const Account = require('../../../caver-account')

/**
 * representing a Keyring which includes `address` and `private keys` by roles.
 * @class
 */
class Keyring {
    /**
     * generates a private key string
     *
     * `caver.wallet.keyring.generatePrivateKey()`
     *
     * @param {string} entropy A random string to increase entropy.
     * @return {string}
     */
    static generatePrivateKey(entropy) {
        return PrivateKey.generate(entropy)
    }

    /**
     * generates a keyring instance
     *
     * `caver.wallet.keyring.generate()`
     *
     * @param {string} entropy A random string to increase entropy.
     * @return {Keyring}
     */
    static generate(entropy) {
        const random = AccountLib.create(entropy || utils.randomHex(32))
        return Keyring.createWithSingleKey(random.address, random.privateKey)
    }

    /**
     * creates a keyring instance with parameters
     *
     * `caver.wallet.keyring.create('0x${address in hex}', '0x{private key}')`
     * `caver.wallet.keyring.create('0x${address in hex}', ['0x{private key}', '0x{private key}'])`
     * `caver.wallet.keyring.create('0x${address in hex}', [['0x{private key}', '0x{private key}'], ['0x{private key}'], ['0x{private key}', '0x{private key}']])`
     *
     * @param {string} address An address of keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key Private key(s) to use in keyring.
     * @return {Keyring}
     */
    static create(address, key) {
        if (_.isString(key)) return Keyring.createWithSingleKey(address, key)
        if (isMultipleKeysFormat(key)) return Keyring.createWithMultipleKey(address, key)
        if (isRoleBasedKeysFormat(key)) return Keyring.createWithRoleBasedKey(address, key)

        throw new Error(`Unsupported key type: ${typeof key}`)
    }

    /**
     * creates a keyring instance from private key string. KlaytnWalletKey format also can be handled.
     *
     * @param {string} privateKey The key parameter can be either normal private key or KlaytnWalletKey format.
     * @return {Keyring}
     */
    static createFromPrivateKey(privateKey) {
        if (!_.isString(privateKey)) throw new Error(`Invalid format of parameter. 'privateKey' should be in format of string`)
        if (utils.isKlaytnWalletKey(privateKey)) return Keyring.createFromKlaytnWalletKey(privateKey)

        const acct = AccountLib.fromPrivate(utils.addHexPrefix(privateKey))
        return Keyring.createWithSingleKey(acct.address, acct.privateKey)
    }

    /**
     * creates a keyring instance from KlaytnWalletKey string.
     *
     * @param {string} klaytnWalletKey A key string in KlaytnWalletKey format.
     * @return {Keyring}
     */
    static createFromKlaytnWalletKey(klaytnWalletKey) {
        if (!_.isString(klaytnWalletKey)) throw new Error(`Invalid format of parameter. 'klaytnWalletKey' should be in format of string`)
        if (!utils.isKlaytnWalletKey(klaytnWalletKey)) {
            throw new Error(`Invalid KlaytnWalletKey: ${klaytnWalletKey}`)
        }
        const parsed = utils.parsePrivateKey(klaytnWalletKey)
        return Keyring.createWithSingleKey(parsed.address, parsed.privateKey)
    }

    /**
     * creates a keyring instance from address and private key string.
     *
     * @param {string} address An address of keyring.
     * @param {string} key A private key string.
     * @return {Keyring}
     */
    static createWithSingleKey(address, key) {
        if (!_.isString(key))
            throw new Error(`Invalid format of parameter. Use 'fromMultipleKey' or 'fromRoleBasedKey' to use more than one.`)
        if (utils.isKlaytnWalletKey(key))
            throw new Error(`Invalid format of parameter. Use 'fromKlaytnWalletKey' to create Keyring from KlaytnWalletKey.`)

        return new Keyring(address, key)
    }

    /**
     * creates a keyring instance from address and multiple private key strings.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<string>} keyArray An array of private key strings.
     * @return {Keyring}
     */
    static createWithMultipleKey(address, keyArray) {
        if (!isMultipleKeysFormat(keyArray))
            throw new Error(`Invalid format of parameter. 'keyArray' should be an array of private key strings.`)

        return new Keyring(address, keyArray)
    }

    /**
     * creates a keyring instance from address and multiple private key strings.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<Array.<string>>} roledBasedKeyArray A two-dimensional array containing arrays of private key strings for each role.
     * @return {Keyring}
     */
    static createWithRoleBasedKey(address, roledBasedKeyArray) {
        if (!isRoleBasedKeysFormat(roledBasedKeyArray))
            throw new Error(
                `Invalid format of parameter. 'roledBasedKeyArray' should be in the form of an array defined as an array for the keys to be used for each role.`
            )

        return new Keyring(address, roledBasedKeyArray)
    }

    /**
     * encrypts a keyring and returns a keystore v4 object.
     *
     * @param {string|Array.<string>|Array.<string>|Keyring} key The key parameter can be an instance of Keyring, a normal private key(KlaytnWalletKey format also supported),
     *                                                           an array of private key strings, or a two-dimensional array containing arrays of private key strings for each role,
     * @param {string} password The password to be used for encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    static encrypt(key, password, options = {}) {
        let keyring
        if (_.isArray(key)) {
            if (options.address === undefined)
                throw new Error(`The address must be defined inside the options object to encrypt multiple keys.`)

            if (isRoleBasedKeysFormat(key)) {
                keyring = Keyring.createWithRoleBasedKey(options.address, key)
            } else if (isMultipleKeysFormat(key)) {
                keyring = Keyring.createWithMultipleKey(options.address, key)
            } else {
                throw new Error(`Invalid key format.`)
            }
        } else if (key instanceof Keyring) {
            keyring = key
        } else if (_.isString(key)) {
            if (options.address) {
                keyring = Keyring.createWithSingleKey(options.address, key)
            } else {
                keyring = Keyring.createFromPrivateKey(key)
            }
        } else {
            throw new Error(`Invalid key format.`)
        }

        return keyring.encrypt(password, options)
    }

    /**
     * encrypts a keyring and returns a keystore v3 object.
     *
     * @param {string|Keyring} key The key parameter can be a normal private key(KlaytnWalletKey format also supported) or an instance of Keyring.
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    static encryptV3(key, password, options = {}) {
        if (!_.isString(key) && !(key instanceof Keyring)) {
            throw new Error(`Invalid parameter. key should be private key string, KlaytnWalletKey or instance of Keyring`)
        }

        const keyring =
            key instanceof Keyring
                ? key
                : options.address
                ? Keyring.createWithSingleKey(options.address, key)
                : Keyring.createFromPrivateKey(key)

        return keyring.encryptV3(password, options)
    }

    /**
     * decrypts a keystore v3 or v4 JSON and returns keyring instance.
     *
     * @param {object} keystore The encrypted keyring to decrypt.
     * @param {string} password The password to use for decryption.
     * @return {Keyring}
     */
    static decrypt(keystore, password) {
        const json = _.isObject(keystore) ? keystore : JSON.parse(keystore)

        if (json.version !== 3 && json.version !== 4) console.warn('This is not a V3 or V4 wallet.')

        if (json.version === 3 && !json.crypto) {
            throw new Error("Invalid keystore V3 format: 'crypto' is not defined.")
        } else if (json.version === 4 && !json.keyring) {
            throw new Error("Invalid keystore V4 format: 'keyring' is not defined.")
        }

        if (json.crypto) {
            if (json.keyring) throw new Error("Invalid key store format: 'crypto' can not be with 'keyring'")

            json.keyring = [json.crypto]
            delete json.crypto
        }

        const keys = []

        // AccountKeyRoleBased format
        if (_.isArray(json.keyring[0])) {
            const transactionKey = decryptKey(json.keyring[KEY_ROLE.ROLE_TRANSACTION_KEY], password)
            transactionKey ? keys.push(transactionKey) : keys.push([])

            const updateKey = decryptKey(json.keyring[KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY], password)
            updateKey ? keys.push(updateKey) : keys.push([])

            const feePayerKey = decryptKey(json.keyring[KEY_ROLE.ROLE_FEE_PAYER_KEY], password)
            feePayerKey ? keys.push(feePayerKey) : keys.push([])
        } else {
            let decrypted = decryptKey(json.keyring, password)
            decrypted = _.isArray(decrypted) ? decrypted : [decrypted]
            keys.push(decrypted)

            // Make format like "[[keys], [], []]"
            for (let i = 0; i < KEY_ROLE.ROLE_LAST - decrypted.length; i++) {
                keys.push([])
            }
        }

        return Keyring.createWithRoleBasedKey(json.address, keys)
    }

    /**
     * recovers the address that was used to sign the given data.
     *
     * @param {string|object} message A signed message string, a hash or an object that includes signed message string to recover.
     * @param {Array.<string>} signature v, r, s values.
     * @param {boolean} preFixed If the last parameter is true, the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message, and assumed to be already prefixed.
     * @return {Keyring}
     */
    static recover(message, signature, preFixed = false) {
        if (_.isObject(message)) {
            return this.recover(message.messageHash, message.signature, true)
        }

        if (!preFixed) {
            message = utils.hashMessage(message)
        }

        return AccountLib.recover(message, AccountLib.encodeSignature(signature)).toLowerCase()
    }

    /**
     * creates a keyring.
     * @param {string} address - The address of keyring.
     * @param {string|Array.<string>|Array.<Array<string>>|PrivateKey|Array.<PrivateKey>|Array.<Array<PrivateKey>>} key - The key(s) to use in keyring.
     */
    constructor(address, key) {
        if (!utils.isAddress(address)) throw new Error(`Invalid address : ${address}`)
        this._address = utils.addHexPrefix(address).toLowerCase()
        this._key = formattingForKeyInKeyring(key)
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
    get roleTransactionKey() {
        return this.getKeyByRole(KEY_ROLE.ROLE_TRANSACTION_KEY)
    }

    /**
     * @type {Array.<PrivateKey>}
     */
    get roleAccountUpdateKey() {
        return this.getKeyByRole(KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY)
    }

    /**
     * @type {Array.<PrivateKey>}
     */
    get roleFeePayerKey() {
        return this.getKeyByRole(KEY_ROLE.ROLE_FEE_PAYER_KEY)
    }

    /**
     * @type {Array.<Array.<PrivateKey>>}
     */
    get key() {
        return this._key
    }

    set key(keyInput) {
        this._key = formattingForKeyInKeyring(keyInput)
    }

    /**
     * returns public key strings in format of role-based.
     *
     * @return {Array.<Array<string>>}
     */
    getPublicKey() {
        const publicKeys = generateKeysFormat()
        for (let i = 0; i < KEY_ROLE.ROLE_LAST; i++) {
            for (const k of this._key[i]) {
                publicKeys[i].push(k.getPublicKey())
            }
        }
        return publicKeys
    }

    /**
     * returns a copied keyring instance
     *
     * @return {Keyring}
     */
    copy() {
        return new Keyring(this._address, this._key)
    }

    /**
     * signs with transactionHash with key and returns signature.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId or the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @param {number} [index] The index of the key to be used. (default: 0)
     * @return {Array<string>}
     */
    signWithKey(transactionHash, chainId, role, index = 0) {
        if (!utils.isTxHashStrict(transactionHash)) throw new Error(`Invalid transaction hash: ${transactionHash}`)

        if (chainId === undefined) {
            throw new Error(`chainId should be defined to sign.`)
        } else {
            chainId = utils.toHex(chainId)
        }
        if (role === undefined) throw new Error(`role should be defined to sign.`)

        const keys = this.getKeyByRole(role)
        if (index >= keys.length) throw new Error(`Invalid index(${index}): index must be less than the length of keys(${keys.length}).`)
        return keys[index].sign(transactionHash, chainId)
    }

    /**
     * signs with transactionHash with multiple keys and returns signatures.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId or the network.
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @return {Array.<Array<string>>}
     */
    signWithKeys(transactionHash, chainId, role) {
        if (!utils.isTxHashStrict(transactionHash)) throw new Error(`Invalid transaction hash: ${transactionHash}`)

        if (chainId === undefined) {
            throw new Error(`chainId should be defined to sign.`)
        } else {
            chainId = utils.toHex(chainId)
        }
        if (role === undefined) throw new Error(`role should be defined to sign.`)

        const signatures = []

        for (const key of this.getKeyByRole(role)) {
            signatures.push(key.sign(transactionHash, chainId))
        }

        return signatures
    }

    /**
     * signs with hashed data and returns result object that includes `signsture`, `message` and `messageHash`
     *
     * @param {string} data The data string to sign.
     * @param {number} [role] A number indicating the role of the key. You can use `caver.wallet.keyring.role`. (default: `caver.wallet.keyring.role.ROLE_TRANSACTION_KEY`)
     * @param {number} [index] The index of the key to be used. (default: 0)
     * @return {object}
     */
    signMessage(data, role, index) {
        const messageHash = utils.hashMessage(data)
        if (role === undefined && index === undefined) {
            role = KEY_ROLE.ROLE_TRANSACTION_KEY
            if (this._key[role].length === 0) throw new Error(`Dafault key(${KEY_ROLE[0]}) does not have enough key to sign.`)
            index = 0
        } else if (role === undefined || index === undefined) {
            throw new Error(
                `To sign message, both role and index must be defined. ` +
                    `If both role and index are not defined, this function signs the message using the default key(${KEY_ROLE[0]}[0]).`
            )
        }

        const keys = this.getKeyByRole(role)
        if (index >= keys.length) throw new Error(`Invalid index(${index}): index must be less than the length of keys(${keys.length}).`)

        const signed = keys[index].signMessage(messageHash)
        signed.message = data
        return signed
    }

    /**
     * returns keys by role.If the key of the role passed as parameter is empty, the default key is returned.
     *
     * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
     * @return {Array.<PrivateKey>}
     */
    getKeyByRole(role) {
        if (role === undefined) throw new Error(`role should be defined.`)
        let key = this._key[role]
        if (key.length === 0 && role > KEY_ROLE.ROLE_TRANSACTION_KEY) {
            if (this._key[KEY_ROLE.ROLE_TRANSACTION_KEY].length === 0) {
                throw new Error(
                    `The key with ${KEY_ROLE[role]} role does not exist. The ${KEY_ROLE[0]} for the default role is also empty.`
                )
            }

            key = this._key[KEY_ROLE.ROLE_TRANSACTION_KEY]
        }
        return key
    }

    /**
     * returns KlaytnWalletKey format. If keyring uses more than one private key, this function will throw error.
     *
     * @return {string}
     */
    getKlaytnWalletKey() {
        const notAvailableError = `The keyring cannot be exported in KlaytnWalletKey format. Use caver.wallet.keyring.encrypt or keyring.encrypt.`
        if (this._key[KEY_ROLE.ROLE_TRANSACTION_KEY].length > 1) throw new Error(notAvailableError)

        for (let i = KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY; i < KEY_ROLE.ROLE_LAST; i++) {
            if (this._key[i].length > 0) {
                throw new Error(notAvailableError)
            }
        }

        const address = utils.addHexPrefix(this._address)
        const privateKey = utils.addHexPrefix(this._key[0][0].privateKey)

        return `${privateKey}0x00${address}`
    }

    /**
     * returns an instance of Account.
     *
     * @param {object|Array.<object>} [options] The options that includes 'threshold' and 'weight'. This is only necessary when keyring use multiple private keys.
     * @return {Account}
     */
    toAccount(options) {
        let isRoleBased = false
        let isWeightedMultiSig = false

        // If key is empty in keyring, account cannot be created from keyring.
        if (isEmptyKey(this._key)) throw new Error(`Failed to create Account instance: Empty key in keyring.`)

        // Determine AccountKeyRoleBased or not.
        for (let i = KEY_ROLE.ROLE_LAST - 1; i > KEY_ROLE.ROLE_TRANSACTION_KEY; i--) {
            if (this._key[i].length > 0) {
                isRoleBased = true
                break
            }
        }

        // Determine AccountKeyWeightedMultiSig or not.
        if (!isRoleBased) {
            if (this._key[KEY_ROLE.ROLE_TRANSACTION_KEY].length === 1 && options !== undefined) {
                if (_.isArray(options) && options.length > 0) options = options[0]
                // if private key length is 1, handled as an AccountKeyWeightedMultiSig only when valid options is defined.
                if (options.threshold !== undefined && options.weight !== undefined) isWeightedMultiSig = true
            }
            if (this._key[KEY_ROLE.ROLE_TRANSACTION_KEY].length > 1) {
                isWeightedMultiSig = true
            }
        }

        if (isRoleBased && options !== undefined && !_.isArray(options))
            throw new Error(`options should define threshold and weight for each roles in an array format`)

        // _validateOptionsForUpdate returns options with 1 threshold and 1 weight for each key when options is not defined.
        if (isRoleBased || isWeightedMultiSig) options = this._validateOptionsForUpdate(options)

        if (isRoleBased) {
            // AccountKeyRoleBased with AccountKeyPublic
            //   options = [ {}, {}, {} ]
            // AccountKeyRoleBased with AccountKeyWeightedMultiSig(roleTransactionKey/roleFeePayerKey)
            //   options = [ {threshold: 1, weight: [1,2]}, {}, {threshold: 1, weight: [1,2]} ]
            const publicKeysByRole = this.getPublicKey()
            return Account.createWithAccountKeyRoleBased(this.address, publicKeysByRole, options)
        }
        if (isWeightedMultiSig) {
            // options = [ {threshold: 1, weight: [1,2] }, {}, {} ]
            options = options[0]

            const publicKeys = this.getPublicKey()[0]
            return Account.createWithAccountKeyWeightedMultiSig(this.address, publicKeys, options)
        }

        if (options !== undefined) throw new Error(`options cannot be defined with single key.`)
        const publicKeyString = this.getPublicKey()[0][0]
        return Account.createWithAccountKeyPublic(this.address, publicKeyString)
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
        let isRoleBased = false

        for (let i = KEY_ROLE.ROLE_TRANSACTION_KEY; i < KEY_ROLE.ROLE_LAST; i++) {
            const roledKey = this._key[i]
            if (i > KEY_ROLE.ROLE_TRANSACTION_KEY && roledKey.length > 0) isRoleBased = true
            keyring.push(encryptKey(roledKey, password, options))
        }

        if (!isRoleBased) keyring = keyring[0]

        return formatEncrypted(4, this._address, keyring, options)
    }

    /**
     * encrypts a keyring and returns a keystore v3 object.
     *
     * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
     * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
     * @return {object}
     */
    encryptV3(password, options) {
        const notAvailableError = `This keyring cannot be encrypted keystore v3. use 'keyring.encrypt(password)'.`
        if (this._key[KEY_ROLE.ROLE_TRANSACTION_KEY].length > 1) throw new Error(notAvailableError)

        for (let i = KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY; i < KEY_ROLE.ROLE_LAST; i++) {
            if (this._key[i].length > 0) {
                throw new Error(notAvailableError)
            }
        }

        options = options || {}

        const crypto = encryptKey(this._key[0][0], password, options)

        return formatEncrypted(3, this._address, crypto, options)
    }

    _validateOptionsForUpdate(options = []) {
        // { threshold: 1, weight: [1, 1] } => [{ threshold: 1, weight: [1, 1] }]
        if (!_.isArray(options)) options = [options]

        for (let i = 0; i < this._key.length; i++) {
            // Validation for options obejct will be operated in AccountKeyWeightedMultiSig class.
            if (options[i] && Object.keys(options[i]).length > 0) continue

            let optionToAdd
            if (this._key[i].length > 1) {
                // default option when option is not set
                optionToAdd = { threshold: 1, weight: Array(this._key[i].length).fill(1) }
            } else {
                // AccountKeyPublic does not need option
                optionToAdd = {}
            }

            if (options[i]) {
                options[i] = optionToAdd
            } else {
                options.push(optionToAdd)
            }
        }
        return options
    }
}

Keyring.PrivateKey = PrivateKey
Keyring.role = KEY_ROLE

module.exports = Keyring

// PrivateKey instance: PrivateKey{}
// single private key string: `0x{private key}`
// multiple private key strings: [`0x{private key}`, `0x{private key}`]
// multiple PrivateKey instances: [PrivateKey{}, PrivateKey{}]
// role-based private key strings: [[`0x{private key}`], [`0x{private key}`, `0x{private key}`], [`0x{private key}`]]
// role-based PrivateKey instances: [[PrivateKey{}], [PrivateKey{}, PrivateKey{}], [PrivateKey{}]]
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
    for (let i = 0; i < KEY_ROLE.ROLE_LAST; i++) {
        fillRoleKey(keys, i, keyInput[i])
    }

    return keys
}

function generateKeysFormat() {
    return Array(KEY_ROLE.ROLE_LAST)
        .fill(null)
        .map(() => [])
}

function isMultipleKeysFormat(keys) {
    if (!_.isArray(keys)) return false
    return keys.every(key => {
        return _.isString(key)
    })
}

function isRoleBasedKeysFormat(roledBasedKeyArray) {
    if (!_.isArray(roledBasedKeyArray)) return false
    if (roledBasedKeyArray.length > KEY_ROLE.ROLE_LAST) return false

    return roledBasedKeyArray.every(arr => {
        return _.isArray(arr)
    })
}

function isEmptyKey(keys) {
    if (!keys) return true

    for (const key of keys) {
        if (key.length > 0) return false
    }
    return true
}

function fillRoleKey(keys, role, keyToAdd) {
    if (keyToAdd === undefined) return
    keyToAdd = Array.isArray(keyToAdd) ? keyToAdd : [keyToAdd]

    for (const keyString of keyToAdd) {
        const key = keyString instanceof PrivateKey ? keyString : new PrivateKey(keyString)
        keys[role].push(key)
    }
}

function decryptKey(encryptedArray, password) {
    if (!encryptedArray || encryptedArray.length === 0) return undefined

    const decryptedArray = []
    for (const encrypted of encryptedArray) {
        let derivedKey
        let kdfparams
        /**
         * Supported kdf modules are the following:
         * 1) pbkdf2
         * 2) scrypt
         */
        if (encrypted.kdf === 'scrypt') {
            kdfparams = encrypted.kdfparams

            // FIXME: support progress reporting callback
            derivedKey = scrypt(
                Buffer.from(password),
                Buffer.from(kdfparams.salt, 'hex'),
                kdfparams.n,
                kdfparams.r,
                kdfparams.p,
                kdfparams.dklen
            )
        } else if (encrypted.kdf === 'pbkdf2') {
            kdfparams = encrypted.kdfparams

            if (kdfparams.prf !== 'hmac-sha256') {
                throw new Error('Unsupported parameters to PBKDF2')
            }

            derivedKey = cryp.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
        } else {
            throw new Error('Unsupported key derivation scheme')
        }

        const ciphertext = Buffer.from(encrypted.ciphertext, 'hex')

        const mac = utils.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).replace('0x', '')
        if (mac !== encrypted.mac) {
            throw new Error('Key derivation failed - possibly wrong password')
        }

        const decipher = cryp.createDecipheriv(encrypted.cipher, derivedKey.slice(0, 16), Buffer.from(encrypted.cipherparams.iv, 'hex'))
        decryptedArray.push(`0x${Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex')}`)
    }
    return decryptedArray
}

function encryptKey(privateKey, password, options) {
    const encryptedArray = []

    if (!privateKey) return encryptedArray

    const privateKeyArray = _.isArray(privateKey) ? privateKey : [privateKey]

    for (let i = 0; i < privateKeyArray.length; i++) {
        const salt = options.salt || cryp.randomBytes(32)
        const iv = options.iv || cryp.randomBytes(16)

        let derivedKey
        const kdf = options.kdf || 'scrypt'
        const kdfparams = {
            dklen: options.dklen || 32,
            salt: salt.toString('hex'),
        }

        /**
         * Supported kdf modules are the following:
         * 1) pbkdf2
         * 2) scrypt - default
         */
        if (kdf === 'pbkdf2') {
            kdfparams.c = options.c || 262144
            kdfparams.prf = 'hmac-sha256'
            derivedKey = cryp.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
        } else if (kdf === 'scrypt') {
            // FIXME: support progress reporting callback
            kdfparams.n = options.n || 4096 // 2048 4096 8192 16384
            kdfparams.r = options.r || 8
            kdfparams.p = options.p || 1
            derivedKey = scrypt(
                Buffer.from(password),
                Buffer.from(kdfparams.salt, 'hex'),
                kdfparams.n,
                kdfparams.r,
                kdfparams.p,
                kdfparams.dklen
            )
        } else {
            throw new Error('Unsupported kdf')
        }

        const cipher = cryp.createCipheriv(options.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv)
        if (!cipher) {
            throw new Error('Unsupported cipher')
        }

        const ciphertext = Buffer.concat([
            cipher.update(Buffer.from(privateKeyArray[i].privateKey.replace('0x', ''), 'hex')),
            cipher.final(),
        ])

        const mac = utils.sha3(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex')])).replace('0x', '')

        encryptedArray.push({
            ciphertext: ciphertext.toString('hex'),
            cipherparams: {
                iv: iv.toString('hex'),
            },
            cipher: options.cipher || 'aes-128-ctr',
            kdf,
            kdfparams,
            mac: mac.toString('hex'),
        })
    }

    return encryptedArray
}

function formatEncrypted(version, address, keyringOrCrypto, options) {
    const keystore = {
        version,
        id: uuid.v4({ random: options.uuid || cryp.randomBytes(16) }),
        address: address.toLowerCase(),
    }

    if (version === 3) {
        keystore.crypto = keyringOrCrypto
    } else if (version === 4) {
        keystore.keyring = keyringOrCrypto
    } else {
        throw new Error(`Unsupported version of keystore`)
    }

    return keystore
}
