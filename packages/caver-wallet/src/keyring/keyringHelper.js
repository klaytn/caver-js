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
const scrypt = require('scrypt-js')
const uuid = require('uuid')
const cryp = typeof global === 'undefined' ? require('crypto-browserify') : require('crypto')
const utils = require('../../../caver-utils')
const PrivateKey = require('./privateKey')

/**
 * The key role string.
 *
 * @example
 * caver.wallet.keyring.role.roleTransactionKey // caver.wallet.keyring.role[0]
 * caver.wallet.keyring.role.roleAccountUpdateKey // // caver.wallet.keyring.role[1]
 * caver.wallet.keyring.role.roleFeePayerKey // // caver.wallet.keyring.role[2]
 *
 * @alias KeyringFactory.role
 * @type {Map<string|number:string>}
 */
const KEY_ROLE = {
    roleTransactionKey: 0,
    0: 'roleTransactionKey',
    roleAccountUpdateKey: 1,
    1: 'roleAccountUpdateKey',
    roleFeePayerKey: 2,
    2: 'roleFeePayerKey',
    roleLast: 3,
}

const MAXIMUM_KEY_NUM = 10

const isMultipleKeysFormat = keys => {
    if (!_.isArray(keys)) return false
    return keys.every(key => {
        return _.isString(key)
    })
}

const isRoleBasedKeysFormat = roledBasedKeyArray => {
    if (!_.isArray(roledBasedKeyArray)) return false
    if (roledBasedKeyArray.length > KEY_ROLE.roleLast) return false

    return roledBasedKeyArray.every(arr => {
        return _.isArray(arr)
    })
}

const validateForSigning = (hash, chainId) => {
    if (!utils.isValidHashStrict(hash)) throw new Error(`Invalid transaction hash: ${hash}`)

    if (chainId === undefined) {
        throw new Error(`chainId should be defined to sign.`)
    }
}

const validateIndexWithKeys = (index, keyLength) => {
    if (!_.isNumber(index)) throw new Error(`Invalid type of index(${index}): index should be number type.`)
    if (index < 0) throw new Error(`Invalid index(${index}): index cannot be negative.`)
    if (index >= keyLength) throw new Error(`Invalid index(${index}): index must be less than the length of keys(${keyLength}).`)
}

const decryptKey = (encryptedArray, password) => {
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
            derivedKey = scrypt.syncScrypt(
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

        const mac = utils.sha3(Buffer.from([...derivedKey.slice(16, 32), ...ciphertext])).replace('0x', '')
        if (mac !== encrypted.mac) {
            throw new Error('Key derivation failed - possibly wrong password')
        }

        const decipher = cryp.createDecipheriv(encrypted.cipher, derivedKey.slice(0, 16), Buffer.from(encrypted.cipherparams.iv, 'hex'))
        decryptedArray.push(`0x${Buffer.from([...decipher.update(ciphertext), ...decipher.final()]).toString('hex')}`)
    }
    return decryptedArray
}

const encryptKey = (privateKey, password, options) => {
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
            derivedKey = scrypt.syncScrypt(
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

        let prv = privateKeyArray[i]
        if (privateKeyArray[i] instanceof PrivateKey) prv = privateKeyArray[i].privateKey
        const ciphertext = Buffer.from([...cipher.update(Buffer.from(prv.replace('0x', ''), 'hex')), ...cipher.final()])

        const mac = utils.sha3(Buffer.from([...derivedKey.slice(16, 32), ...ciphertext])).replace('0x', '')

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

const formatEncrypted = (version, address, keyringOrCrypto, options) => {
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

module.exports = {
    KEY_ROLE,
    MAXIMUM_KEY_NUM,
    isMultipleKeysFormat,
    isRoleBasedKeysFormat,
    validateForSigning,
    validateIndexWithKeys,
    decryptKey,
    encryptKey,
    formatEncrypted,
}
