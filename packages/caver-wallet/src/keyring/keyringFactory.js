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
 * representing a KeyringFactory which supports create functions for Keyring({@link SingleKeyring}/{@link MultipleKeyring}/{@link RoleBasedKeyring}).
 * @class
 * @hideconstructor
 */
class KeyringFactory {
    /**
     * Generates a {@link SingleKeyring} instance with a randomly generated private key.
     *
     * @example
     * const keyring = caver.wallet.keyring.generate()
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {SingleKeyring} A randomly generated single keyring instance is returned.
     */
    static generate(entropy) {
        const random = AccountLib.create(entropy || utils.randomHex(32))
        return KeyringFactory.createWithSingleKey(random.address, random.privateKey)
    }

    /**
     * generates a single private key string
     *
     * @example
     * const privateKey = caver.wallet.keyring.generateSingleKey()
     *
     * @param {string} [entropy] A random string to increase entropy.
     * @return {string} The private key string is returned.
     */
    static generateSingleKey(entropy) {
        return AccountLib.create(entropy || utils.randomHex(32)).privateKey
    }

    /**
     * Generates an array of private key strings.
     *
     * @example
     * const privateKeys = caver.wallet.keyring.generateMultipleKeys()
     *
     * @param {number} num The number of private key strings.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<string>} An array that includes private key strings is returned.
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
     * Generates a 2D array of which each array element contains keys defined for each {@link https://docs.klaytn.com/klaytn/design/accounts#roles|role}.
     *
     * @example
     * const privateKeysByRoles = caver.wallet.keyring.generateRoleBasedKeys([2, 1, 3])
     *
     * @param {Array.<number>} numArr An array containing the number of keys for each {@link https://docs.klaytn.com/klaytn/design/accounts#roles|role}.
     * @param {string} [entropy] A random string to increase entropy.
     * @return {Array.<Array.<string>>} A 2D array of which each array element contains keys defined for each role is returned.
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
     * Creates a Keyring instance with parameters.
     *
     * If key is a private key string, a {@link SingleKeyring} instance that uses a single private key is created.
     * If key is an array containing private key strings, a {@link MultipleKeyring} instance that use multiple private keys is created.
     * If key is a 2D array of which each element contains the private key(s) to be used for each role, a {@link RoleBasedKeyring} instance is created.
     *
     * @example
     * const singleKeyring = caver.wallet.keyring.create('0x${address in hex}', '0x{private key}')
     * const multipleKeyring = caver.wallet.keyring.create('0x${address in hex}', ['0x{private key}', '0x{private key}'])
     * const roleBasedKeyring = caver.wallet.keyring.create('0x${address in hex}', [['0x{private key}', '0x{private key}'], ['0x{private key}'], ['0x{private key}', '0x{private key}']])
     *
     * @param {string} address An address of keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key The private key string, an array of private keys, or a 2D array of which each element contains key(s) to be used for each {@link https://docs.klaytn.com/klaytn/design/accounts#roles|role}.
     * @return {KeyringContainer.Keyring} The keyring instance is returned. Depending on the key parameter, it can be {@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}.
     */
    static create(address, key) {
        if (_.isString(key)) return KeyringFactory.createWithSingleKey(address, key)
        if (isMultipleKeysFormat(key)) return KeyringFactory.createWithMultipleKey(address, key)
        if (isRoleBasedKeysFormat(key)) return KeyringFactory.createWithRoleBasedKey(address, key)

        throw new Error(`Unsupported key type: ${typeof key}`)
    }

    /**
     * Creates a SingleKeyring instance from a private key string or a {@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format|KlaytnWalletKey}.
     *
     * @example
     * const keyring = caver.wallet.keyring.createFromPrivateKey('0x{private key}')
     *
     * @param {string} privateKey This parameter can be either a private key or KlaytnWalletKey.
     * @return {SingleKeyring} The SingleKeyring instance is returned.
     */
    static createFromPrivateKey(privateKey) {
        if (!_.isString(privateKey)) throw new Error(`Invalid format of parameter. 'privateKey' should be in format of string`)
        if (utils.isKlaytnWalletKey(privateKey)) return KeyringFactory.createFromKlaytnWalletKey(privateKey)

        const acct = AccountLib.fromPrivate(utils.addHexPrefix(privateKey))
        return KeyringFactory.createWithSingleKey(acct.address, acct.privateKey)
    }

    /**
     * Creates a SingleKeyring instance from a {@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format|KlaytnWalletKey} string.
     *
     * @example
     * const keyring = caver.wallet.keyring.createFromKlaytnWalletKey('0x{private key}0x{type}0x{address in hex}')
     *
     * @param {string} klaytnWalletKey The KlaytnWalletKey string.
     * @return {SingleKeyring} The SingleKeyring instance is returned.
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
     * Creates a {@link SingleKeyring} instance from an address and a private key string.
     *
     * @example
     * const keyring = caver.wallet.keyring.createWithSingleKey('0x{address in hex}', '0x{private key}')
     *
     * @param {string} address An address to be used for creating a keyring.
     * @param {string} key A private key string.
     * @return {SingleKeyring} The {@link SingleKeyring} instance is returned.
     */
    static createWithSingleKey(address, key) {
        if (!_.isString(key))
            throw new Error(`Invalid format of parameter. Use 'fromMultipleKey' or 'fromRoleBasedKey' for two or more keys.`)
        if (utils.isKlaytnWalletKey(key))
            throw new Error(`Invalid format of parameter. Use 'fromKlaytnWalletKey' to create Keyring from KlaytnWalletKey.`)

        return new SingleKeyring(address, key)
    }

    /**
     * Creates a {@link MultipleKeyring} instance from an address and private key strings.
     *
     * @example
     * const keyring = caver.wallet.keyring.createWithMultipleKey('0x{address in hex}', ['0x{private key1}', '0x{private key2}' ])
     *
     * @param {string} address An address of keyring.
     * @param {Array.<string>} keyArray An array of private key strings.
     * @return {MultipleKeyring} The {@link MultipleKeyring} instance is returned.
     */
    static createWithMultipleKey(address, keyArray) {
        if (!isMultipleKeysFormat(keyArray))
            throw new Error(`Invalid format of parameter. 'keyArray' should be an array of private key strings.`)

        return new MultipleKeyring(address, keyArray)
    }

    /**
     * Creates a {@link RoleBasedKeyring} instance from an address and a 2D array of which each array element contains keys defined for each {@link https://docs.klaytn.com/klaytn/design/accounts#roles|role}.
     *
     * @param {string} address An address of keyring.
     * @param {Array.<Array.<string>>} roledBasedKeyArray A two-dimensional array containing arrays of private key strings for each role.
     * @return {RoleBasedKeyring} The {@link RoleBasedKeyring} instance is returned.
     */
    static createWithRoleBasedKey(address, roledBasedKeyArray) {
        if (!isRoleBasedKeysFormat(roledBasedKeyArray))
            throw new Error(
                `Invalid format of parameter. 'roledBasedKeyArray' should be in the form of an array defined as an array for the keys to be used for each role.`
            )

        return new RoleBasedKeyring(address, roledBasedKeyArray)
    }

    /**
     * An object that defines encrypted keystore.
     *
     * @typedef {object} KeyringFactory.Keystore
     * @property {number} version - The version number of the keystore.
     * @property {string} id - The id in the keystore.
     * @property {string} address - The address in the encrypted keyring.
     * @property {object} [crypto] - The encrypted private key for v3.
     * @property {Array.<object>|Array.<Array.<object>>} [keyring] - The encrypted private key(s) for v4.
     */
    /**
     * Decrypts a keystore v3 or v4 JSON and returns the decrypted Keyring instance.
     *
     * @example
     * // Decrypt keystroe v4 (encrypted single keyring)
     * const decrypted = caver.wallet.keyring.decrypt({
     *     version: 4,
     *     id: '9c12de05-0153-41c7-a8b7-849472eb5de7',
     *     address: '0xc02cec4d0346bf4124deeb55c5216a4138a40a8c',
     *     keyring: [
     *         {
     *             ciphertext: 'eacf496cea5e80eca291251b3743bf93cdbcf7072efc3a74efeaf518e2796b15',
     *             cipherparams: { iv: 'd688a4319342e872cefcf51aef3ec2da' },
     *             cipher: 'aes-128-ctr',
     *             kdf: 'scrypt',
     *             kdfparams: {
     *                 dklen: 32,
     *                 salt: 'c3cee502c7157e0faa42386c6d666116ffcdf093c345166c502e23bc34e6ba40',
     *                 n: 4096,
     *                 r: 8,
     *                 p: 1
     *             },
     *             mac: '4b49574f3d3356fa0d04f73e07d5a2a6bbfdd185bedfa31f37f347bc98f2ef26'
     *         }
     *     ]
     * }, 'password')
     *
     * // Decrypt keystroe v4 (encrypted multiple keyring)
     * const decrypted = caver.wallet.keyring.decrypt({
     *     version: 4,
     *     id: '55da3f9c-6444-4fc1-abfa-f2eabfc57501',
     *     address: '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
     *     keyring: [
     *         {
     *             ciphertext: '93dd2c777abd9b80a0be8e1eb9739cbf27c127621a5d3f81e7779e47d3bb22f6',
     *             cipherparams: { iv: '84f90907f3f54f53d19cbd6ae1496b86' },
     *             cipher: 'aes-128-ctr',
     *             kdf: 'scrypt',
     *             kdfparams: {
     *                 dklen: 32,
     *                 salt: '69bf176a136c67a39d131912fb1e0ada4be0ed9f882448e1557b5c4233006e10',
     *                 n: 4096,
     *                 r: 8,
     *                 p: 1,
     *             },
     *             mac: '8f6d1d234f4a87162cf3de0c7fb1d4a8421cd8f5a97b86b1a8e576ffc1eb52d2',
     *         },
     *         {
     *             ciphertext: '53d50b4e86b550b26919d9b8cea762cd3c637dfe4f2a0f18995d3401ead839a6',
     *             cipherparams: { iv: 'd7a6f63558996a9f99e7daabd289aa2c' },
     *             cipher: 'aes-128-ctr',
     *             kdf: 'scrypt',
     *             kdfparams: {
     *                 dklen: 32,
     *                 salt: '966116898d90c3e53ea09e4850a71e16df9533c1f9e1b2e1a9edec781e1ad44f',
     *                 n: 4096,
     *                 r: 8,
     *                 p: 1,
     *             },
     *             mac: 'bca7125e17565c672a110ace9a25755847d42b81aa7df4bb8f5ce01ef7213295',
     *         },
     *     ],
     * }, 'password')
     *
     * // Decrypt keystroe v4 (encrypted role-based keyring)
     * const decrypted = caver.wallet.keyring.decrypt({
     *     version: 4,
     *     id: '55da3f9c-6444-4fc1-abfa-f2eabfc57501',
     *     address: '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
     *     keyring: [
     *         [
     *             {
     *                 ciphertext: '93dd2c777abd9b80a0be8e1eb9739cbf27c127621a5d3f81e7779e47d3bb22f6',
     *                 cipherparams: { iv: '84f90907f3f54f53d19cbd6ae1496b86' },
     *                 cipher: 'aes-128-ctr',
     *                 kdf: 'scrypt',
     *                 kdfparams: {
     *                     dklen: 32,
     *                     salt: '69bf176a136c67a39d131912fb1e0ada4be0ed9f882448e1557b5c4233006e10',
     *                     n: 4096,
     *                     r: 8,
     *                     p: 1,
     *                 },
     *                 mac: '8f6d1d234f4a87162cf3de0c7fb1d4a8421cd8f5a97b86b1a8e576ffc1eb52d2',
     *             },
     *             {
     *                 ciphertext: '53d50b4e86b550b26919d9b8cea762cd3c637dfe4f2a0f18995d3401ead839a6',
     *                 cipherparams: { iv: 'd7a6f63558996a9f99e7daabd289aa2c' },
     *                 cipher: 'aes-128-ctr',
     *                 kdf: 'scrypt',
     *                 kdfparams: {
     *                     dklen: 32,
     *                     salt: '966116898d90c3e53ea09e4850a71e16df9533c1f9e1b2e1a9edec781e1ad44f',
     *                     n: 4096,
     *                     r: 8,
     *                     p: 1,
     *                 },
     *                 mac: 'bca7125e17565c672a110ace9a25755847d42b81aa7df4bb8f5ce01ef7213295',
     *             },
     *         ],
     *         [
     *             {
     *                 ciphertext: 'f16def98a70bb2dae053f791882f3254c66d63416633b8d91c2848893e7876ce',
     *                 cipherparams: { iv: 'f5006128a4c53bc02cada64d095c15cf' },
     *                 cipher: 'aes-128-ctr',
     *                 kdf: 'scrypt',
     *                 kdfparams: {
     *                     dklen: 32,
     *                     salt: '0d8a2f71f79c4880e43ff0795f6841a24cb18838b3ca8ecaeb0cda72da9a72ce',
     *                     n: 4096,
     *                     r: 8,
     *                     p: 1,
     *                 },
     *                 mac: '38b79276c3805b9d2ff5fbabf1b9d4ead295151b95401c1e54aed782502fc90a',
     *             },
     *         ],
     *         [
     *             {
     *                 ciphertext: '544dbcc327942a6a52ad6a7d537e4459506afc700a6da4e8edebd62fb3dd55ee',
     *                 cipherparams: { iv: '05dd5d25ad6426e026818b6fa9b25818' },
     *                 cipher: 'aes-128-ctr',
     *                 kdf: 'scrypt',
     *                 kdfparams: {
     *                     dklen: 32,
     *                     salt: '3a9003c1527f65c772c54c6056a38b0048c2e2d58dc0e584a1d867f2039a25aa',
     *                     n: 4096,
     *                     r: 8,
     *                     p: 1,
     *                 },
     *                 mac: '19a698b51409cc9ac22d63d329b1201af3c89a04a1faea3111eec4ca97f2e00f',
     *             },
     *             {
     *                 ciphertext: 'dd6b920f02cbcf5998ed205f8867ddbd9b6b088add8dfe1774a9fda29ff3920b',
     *                 cipherparams: { iv: 'ac04c0f4559dad80dc86c975d1ef7067' },
     *                 cipher: 'aes-128-ctr',
     *                 kdf: 'scrypt',
     *                 kdfparams: {
     *                     dklen: 32,
     *                     salt: '22279c6dbcc706d7daa120022a236cfe149496dca8232b0f8159d1df999569d6',
     *                     n: 4096,
     *                     r: 8,
     *                     p: 1,
     *                 },
     *                 mac: '1c54f7378fa279a49a2f790a0adb683defad8535a21bdf2f3dadc48a7bddf517',
     *             },
     *         ],
     *     ],
     * }, 'password')
     *
     * @param {KeyringFactory.KeystoreV4} keystore The keystore v3 or v4 to decrypt.
     * @param {string} password The password used for encryption.
     * @return {KeyringContainer.Keyring} The  decrypted keyring ({@link SingleKeyring}, {@link MultipleKeyring} or {@link RoleBasedKeyring}) instance is returned.
     */
    static decrypt(keystore, password) {
        // To deep copy an object, using JSON.parse and JSON.stringify (object -> string -> object)
        const json = _.isObject(keystore) ? _.cloneDeep(keystore) : JSON.parse(keystore)

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
}

/**
 * @type {typeof PrivateKey}
 * @example
 * caver.wallet.keyring.privateKey
 * */
KeyringFactory.privateKey = PrivateKey
/**
 * @type {typeof SingleKeyring}
 * @example
 * caver.wallet.keyring.singleKeyring
 * */
KeyringFactory.singleKeyring = SingleKeyring
/**
 * @type {typeof MultipleKeyring}
 * @example
 * caver.wallet.keyring.multipleKeyring
 * */
KeyringFactory.multipleKeyring = MultipleKeyring
/**
 * @type {typeof RoleBasedKeyring}
 * @example
 * caver.wallet.keyring.roleBasedKeyring
 * */
KeyringFactory.roleBasedKeyring = RoleBasedKeyring
/**
 * @type {typeof SignatureData}
 * @example
 * caver.wallet.keyring.signatureData
 */
KeyringFactory.signatureData = SignatureData

KeyringFactory.role = KEY_ROLE

module.exports = KeyringFactory
