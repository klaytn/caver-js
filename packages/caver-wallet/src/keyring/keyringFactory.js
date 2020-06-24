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
const AccountLib = require('eth-lib/lib/account')

const utils = require('../../../caver-utils/src')
const PrivateKey = require('./privateKey')
const { KEY_ROLE, isMultipleKeysFormat, isRoleBasedKeysFormat } = require('./keyringHelper')
const { decryptKey } = require('./keyringHelper')
const SingleKeyring = require('./singleKeyring')
const MultipleKeyring = require('./multipleKeyring')
const RoleBasedKeyring = require('./roleBasedKeyring')
const SignatureData = require('./signatureData')

/**
 * representing a KeyringFactory which supports create functions for Keyring(SingleKeyring/MultipleKeyring/RoleBasedKeyring)
 * @class
 */
class KeyringFactory {
    /**
     * generates a keyring instance
     *
     * `caver.wallet.keyring.generate()`
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {SingleKeyring}
     */
    static generate(entropy) {
        const random = AccountLib.create(entropy || utils.randomHex(32))
        return KeyringFactory.createWithSingleKey(random.address, random.privateKey)
    }

    /**
     * generates a single private key string
     *
     * `caver.wallet.keyring.generateSingleKey()`
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {String}
     */
    static generateSingleKey(entropy) {
        return AccountLib.create(entropy || utils.randomHex(32)).privateKey
    }

    /**
     * generates an array of private key strings
     *
     * `caver.wallet.keyring.generateMultipleKeys()`
     *
     * @param {number} num A length of keys.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<String>}
     */
    static generateMultipleKeys(num, entropy) {
        if (num === undefined || !_.isNumber(num) || _.isString(num)) {
            throw new Error(`To generate random multiple private keys, the number of keys should be defined.`)
        }

        const randomKeys = []
        for (let i = 0; i < num; i++) {
            randomKeys.push(AccountLib.create(entropy || utils.randomHex(32)).privateKey)
        }
        return randomKeys
    }

    /**
     * generates an array in which keys to be used for each role are defined as an array.
     *
     * `caver.wallet.keyring.generateRoleBasedKeys()`
     *
     * @param {Array.<number>} numArr An array containing the number of keys for each role.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<Array.<String>>}
     */
    static generateRoleBasedKeys(numArr, entropy) {
        if (numArr === undefined || !_.isArray(numArr) || _.isString(numArr)) {
            throw new Error(
                `To generate random role-based private keys, an array containing the number of keys for each role should be defined.`
            )
        }
        if (numArr.length > KEY_ROLE.roleLast) {
            throw new Error(`Unsupported role. The length of array should be less than ${KEY_ROLE.roleLast}.`)
        }

        const randomKeys = [[], [], []]
        for (let i = 0; i < numArr.length; i++) {
            for (let j = 0; j < numArr[i]; j++) {
                randomKeys[i].push(AccountLib.create(entropy || utils.randomHex(32)).privateKey)
            }
        }
        return randomKeys
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
     * @return {AbstractKeyring}
     */
    static create(address, key) {
        if (_.isString(key)) return KeyringFactory.createWithSingleKey(address, key)
        if (isMultipleKeysFormat(key)) return KeyringFactory.createWithMultipleKey(address, key)
        if (isRoleBasedKeysFormat(key)) return KeyringFactory.createWithRoleBasedKey(address, key)

        throw new Error(`Unsupported key type: ${typeof key}`)
    }

    /**
     * creates a keyring instance from a private key string. KlaytnWalletKey format also can be handled.
     *
     * @param {string} privateKey The key parameter can be either normal private key or KlaytnWalletKey format.
     * @return {SingleKeyring}
     */
    static createFromPrivateKey(privateKey) {
        if (!_.isString(privateKey)) throw new Error(`Invalid format of parameter. 'privateKey' should be in format of string`)
        if (utils.isKlaytnWalletKey(privateKey)) return KeyringFactory.createFromKlaytnWalletKey(privateKey)

        const acct = AccountLib.fromPrivate(utils.addHexPrefix(privateKey))
        return KeyringFactory.createWithSingleKey(acct.address, acct.privateKey)
    }

    /**
     * creates a keyring instance from a KlaytnWalletKey string.
     *
     * @param {string} klaytnWalletKey A key string in KlaytnWalletKey format.
     * @return {SingleKeyring}
     */
    static createFromKlaytnWalletKey(klaytnWalletKey) {
        if (!_.isString(klaytnWalletKey)) throw new Error(`Invalid format of parameter. 'klaytnWalletKey' should be in format of string`)
        if (!utils.isKlaytnWalletKey(klaytnWalletKey)) {
            throw new Error(`Invalid KlaytnWalletKey: ${klaytnWalletKey}`)
        }
        const parsed = utils.parsePrivateKey(klaytnWalletKey)
        return KeyringFactory.createWithSingleKey(parsed.address, parsed.privateKey)
    }

    /**
     * creates a keyring instance from an address and a private key string.
     *
     * @param {string} address An address of keyring.
     * @param {string} key A private key string.
     * @return {SingleKeyring}
     */
    static createWithSingleKey(address, key) {
        if (!_.isString(key))
            throw new Error(`Invalid format of parameter. Use 'fromMultipleKey' or 'fromRoleBasedKey' for two or more keys.`)
        if (utils.isKlaytnWalletKey(key))
            throw new Error(`Invalid format of parameter. Use 'fromKlaytnWalletKey' to create Keyring from KlaytnWalletKey.`)

        return new SingleKeyring(address, key)
    }

    /**
     * creates a keyring instance from an address and multiple private key strings.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<string>} keyArray An array of private key strings.
     * @return {MultipleKeyring}
     */
    static createWithMultipleKey(address, keyArray) {
        if (!isMultipleKeysFormat(keyArray))
            throw new Error(`Invalid format of parameter. 'keyArray' should be an array of private key strings.`)

        return new MultipleKeyring(address, keyArray)
    }

    /**
     * creates a keyring instance from an address and an array in which keys to be used for each role are defined as an array.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<Array.<string>>} roledBasedKeyArray A two-dimensional array containing arrays of private key strings for each role.
     * @return {RoleBasedKeyring}
     */
    static createWithRoleBasedKey(address, roledBasedKeyArray) {
        if (!isRoleBasedKeysFormat(roledBasedKeyArray))
            throw new Error(
                `Invalid format of parameter. 'roledBasedKeyArray' should be in the form of an array defined as an array for the keys to be used for each role.`
            )

        return new RoleBasedKeyring(address, roledBasedKeyArray)
    }

    /**
     * decrypts a keystore v3 or v4 JSON and returns keyring instance.
     *
     * @param {object} keystore The encrypted keystore to decrypt.
     * @param {string} password The password to use for decryption.
     * @return {AbstractKeyring}
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
            if (json.keyring) throw new Error("Invalid key store format: 'crypto' and 'keyring' cannot be defined together.")

            json.keyring = [json.crypto]
            delete json.crypto
        }

        // AccountKeyRoleBased format
        if (_.isArray(json.keyring[0])) {
            const keys = []
            const transactionKey = decryptKey(json.keyring[KEY_ROLE.roleTransactionKey], password)
            transactionKey ? keys.push(transactionKey) : keys.push([])

            const updateKey = decryptKey(json.keyring[KEY_ROLE.roleAccountUpdateKey], password)
            updateKey ? keys.push(updateKey) : keys.push([])

            const feePayerKey = decryptKey(json.keyring[KEY_ROLE.roleFeePayerKey], password)
            feePayerKey ? keys.push(feePayerKey) : keys.push([])

            return KeyringFactory.createWithRoleBasedKey(json.address, keys)
        }

        let decrypted = decryptKey(json.keyring, password)
        decrypted = _.isArray(decrypted) ? decrypted : [decrypted]
        if (decrypted.length === 1) return KeyringFactory.createWithSingleKey(json.address, decrypted[0])

        return KeyringFactory.createWithMultipleKey(json.address, decrypted)
    }

    // /**
    //  * encrypts a keyring and returns a keystore v4 object.
    //  *
    //  * @param {string|Array.<string>|Array.<string>|Keyring} key The key parameter can be an instance of Keyring, a normal private key(KlaytnWalletKey format also supported),
    //  *                                                           an array of private key strings, or a two-dimensional array containing arrays of private key strings for each role,
    //  * @param {string} password The password to be used for encryption. The encrypted key store can be decrypted with this password.
    //  * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
    //  * @return {object}
    //  */
    // static encrypt(key, password, options = {}) {
    //     let keyring
    //     if (_.isArray(key)) {
    //         if (options.address === undefined)
    //             throw new Error(`The address must be defined inside the options object to encrypt multiple keys.`)

    //         if (isRoleBasedKeysFormat(key)) {
    //             keyring = KeyringFactory.createWithRoleBasedKey(options.address, key)
    //         } else if (isMultipleKeysFormat(key)) {
    //             keyring = KeyringFactory.createWithMultipleKey(options.address, key)
    //         } else {
    //             throw new Error(`Invalid key format.`)
    //         }
    //     } else if (key instanceof AbstractKeyring) {
    //         keyring = key
    //     } else if (_.isString(key)) {
    //         if (options.address) {
    //             if (utils.isKlaytnWalletKey(key)) {
    //                 keyring = KeyringFactory.createFromKlaytnWalletKey(key)
    //                 if (keyring.address.toLowerCase() !== options.address.toLowerCase()) {
    //                     throw new Error(
    //                         `The address defined in options(${options.address}) does not match the address of KlaytnWalletKey(${keyring.address}) entered as a parameter.`
    //                     )
    //                 }
    //             } else {
    //                 keyring = KeyringFactory.createWithSingleKey(options.address, key)
    //             }
    //         } else {
    //             keyring = KeyringFactory.createFromPrivateKey(key)
    //         }
    //     } else {
    //         throw new Error(`Invalid key format.`)
    //     }

    //     return keyring.encrypt(password, options)
    // }

    // /**
    //  * encrypts a keyring and returns a keystore v3 object.
    //  *
    //  * @param {string|Keyring} key The key parameter can be a normal private key(KlaytnWalletKey format also supported) or an instance of Keyring.
    //  * @param {string} password The password to be used for keyring encryption. The encrypted key store can be decrypted with this password.
    //  * @param {object} options The options to use when encrypt a keyring. See `keyring.encrypt` for more detail about options.
    //  * @return {object}
    //  */
    // static encryptV3(key, password, options = {}) {
    //     if (!_.isString(key) && !(key instanceof Keyring)) {
    //         throw new Error(`Invalid parameter. key should be a private key string, KlaytnWalletKey or instance of Keyring`)
    //     }

    //     let keyring
    //     if (key instanceof Keyring) {
    //         keyring = key
    //     } else if (options.address) {
    //         if (utils.isKlaytnWalletKey(key)) {
    //             keyring = KeyringFactory.createFromKlaytnWalletKey(key)
    //             if (keyring.address.toLowerCase() !== options.address.toLowerCase()) {
    //                 throw new Error(
    //                     `The address defined in options(${options.address}) does not match the address of KlaytnWalletKey(${keyring.address}) entered as a parameter.`
    //                 )
    //             }
    //         } else {
    //             keyring = KeyringFactory.createWithSingleKey(options.address, key)
    //         }
    //     } else {
    //         keyring = KeyringFactory.createFromPrivateKey(key)
    //     }

    //     return keyring.encryptV3(password, options)
    // }
}

KeyringFactory.privateKey = PrivateKey
KeyringFactory.singleKeyring = SingleKeyring
KeyringFactory.multipleKeyring = MultipleKeyring
KeyringFactory.roleBasedKeyring = RoleBasedKeyring
KeyringFactory.role = KEY_ROLE
KeyringFactory.signatureData = SignatureData

module.exports = KeyringFactory
