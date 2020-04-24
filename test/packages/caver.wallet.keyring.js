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
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

const expect = chai.expect

const testRPCURL = require('../testrpc')

const Caver = require('../../index.js')
const utils = require('../../packages/caver-utils')
const Keyring = require('../../packages/caver-wallet/src/keyring/keyring')
const Account = require('../../packages/caver-account')
const AccountKeyPublic = require('../../packages/caver-account/src/accountKey/accountKeyPublic')
const AccountKeyWeightedMultiSig = require('../../packages/caver-account/src/accountKey/accountKeyWeightedMultiSig')
const AccountKeyRoleBased = require('../../packages/caver-account/src/accountKey/accountKeyRoleBased')
const PrivateKey = require('../../packages/caver-wallet/src/keyring/privateKey')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

function validateKeyring(data, { expectedAddress, expectedKey } = {}) {
    expect(data instanceof Keyring).to.be.true
    const objectKeys = ['_address', '_key']

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    if (expectedAddress !== undefined) {
        expect(data.address.toLowerCase()).to.equal(expectedAddress.toLowerCase())
    }

    if (expectedKey !== undefined) {
        if (_.isArray(expectedKey) && _.isString(expectedKey[0])) expectedKey = [expectedKey, [], []]
        if (_.isString(expectedKey)) expectedKey = [[expectedKey], [], []]
        for (let i = 0; i < data.key.length; i++) {
            for (let j = 0; j < data.key[i].length; j++) {
                const privateKeyString = expectedKey[i][j] instanceof PrivateKey ? expectedKey[i][j].privateKey : expectedKey[i][j]
                expect(data.key[i][j].privateKey.toLowerCase()).to.equal(privateKeyString.toLowerCase())
            }
        }
    }
}

function validateKeystore(data, password, { address, expectedKey, keyringLength = 1 }, version = 4) {
    const objectKeys = ['version', 'id', 'address']

    if (version > 3) {
        objectKeys.push('keyring')
    } else {
        objectKeys.push('crypto')
    }

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)
    if (version > 3) {
        if (_.isArray(keyringLength)) {
            for (let i = 0; i < keyringLength.length; i++) {
                expect(data.keyring[i].length).to.equal(keyringLength[i])
            }
        } else {
            expect(data.keyring.length).to.equal(keyringLength)
        }
    }

    expect(data.version).to.equal(version)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    const prefixTrimmed = data.address.replace(/^(0x)*/i, '')
    expect(prefixTrimmed).to.match(new RegExp(`^${address.slice(2)}$`, 'i'))

    const keyring = caver.wallet.keyring.decrypt(data, password)
    validateKeyring(keyring, { expectedAddress: address, expectedKey })
}

function validateAccount(data, { keyring, expectedAccountKey, exepectedOptions }) {
    expect(data instanceof Account).to.be.true
    const objectKeys = ['_address', '_accountKey']

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    if (keyring !== undefined) {
        expect(data.address.toLowerCase()).to.equal(keyring.address.toLowerCase())
    }

    if (expectedAccountKey !== undefined) {
        switch (expectedAccountKey) {
            case 'AccountKeyPublic':
                validateAccountKeyPublic(data.accountKey, keyring.key[0][0])
                break
            case 'AccountKeyWeightedMultiSig':
                validateAccountKeyWeightedMultiSig(data.accountKey, keyring.key[0], exepectedOptions)
                break
            case 'AccountKeyRoleBased':
                expect(data.accountKey instanceof AccountKeyRoleBased).to.be.true
                for (let i = 0; i < data.accountKey.accountKeys.length; i++) {
                    const acctKey = data.accountKey.accountKeys[i]
                    if (acctKey instanceof AccountKeyPublic) {
                        validateAccountKeyPublic(acctKey, keyring.key[i])
                    } else {
                        validateAccountKeyWeightedMultiSig(acctKey, keyring.key[i], exepectedOptions[i])
                    }
                }
                break
        }
    }
}

function validateAccountKeyPublic(key, singleKey) {
    expect(key instanceof AccountKeyPublic).to.be.true
    expect(key.publicKey).to.equal(singleKey.getPublicKey())
}

function validateAccountKeyWeightedMultiSig(key, multipleKeys, options) {
    expect(key instanceof AccountKeyWeightedMultiSig).to.be.true
    if (options) {
        expect(key.threshold).to.equal(options.threshold)
    }
    for (let i = 0; i < key.weightedPublicKeys.length; i++) {
        expect(key.weightedPublicKeys[i].publicKey).to.equal(multipleKeys[i].getPublicKey())
        if (options) {
            expect(key.weightedPublicKeys[i].weight).to.equal(options.weight[i])
        }
    }
}

function generateDecoupledKeyring() {
    const keyring = caver.wallet.keyring.generate()
    keyring.key = caver.wallet.keyring.generatePrivateKey()
    return keyring
}

function generateMultiSigKeyring(num = 3) {
    const keyring = caver.wallet.keyring.generate()
    const multipleKeys = []
    for (let i = 0; i < num; i++) {
        multipleKeys.push(caver.wallet.keyring.generatePrivateKey())
    }
    keyring.key = multipleKeys
    return keyring
}

function generateRoleBasedKeyring(numArr) {
    if (numArr === undefined) {
        numArr = Array(caver.wallet.keyring.role.ROLE_LAST).fill(1)
    }
    const keyring = caver.wallet.keyring.generate()
    const roleBased = []
    for (let i = 0; i < numArr.length; i++) {
        const keys = []
        for (let j = 0; j < numArr[i]; j++) {
            keys.push(caver.wallet.keyring.generatePrivateKey())
        }
        roleBased.push(keys)
    }
    keyring.key = roleBased
    return keyring
}

describe('caver.wallet.keyring.generatePrivateKey', () => {
    context('CAVERJS-UNIT-KEYRING-001: input: no parameter', () => {
        it('should return valid private key string', () => {
            const result = caver.wallet.keyring.generatePrivateKey()
            expect(utils.isValidPrivateKey(result)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-002: input: entropy', () => {
        it('should return valid private key string', () => {
            const entropy = caver.utils.randomHex(32)

            const result = caver.wallet.keyring.generatePrivateKey(entropy)
            expect(utils.isValidPrivateKey(result)).to.be.true
        })
    })
})

describe('caver.wallet.keyring.generate', () => {
    context('CAVERJS-UNIT-KEYRING-003: input: no parameter', () => {
        it('should return valid private Keyring instance', () => {
            const result = caver.wallet.keyring.generate()
            validateKeyring(result)
        })
    })

    context('CAVERJS-UNIT-KEYRING-004: input: entropy', () => {
        it('should return valid private Keyring instance', () => {
            const entropy = caver.utils.randomHex(32)

            const result = caver.wallet.keyring.generate(entropy)
            validateKeyring(result)
        })
    })
})

describe('caver.wallet.keyring.createFromPrivateKey', () => {
    context('CAVERJS-UNIT-KEYRING-005: input: single private key', () => {
        it('should create Keyring instance from private key string', () => {
            const keyring = caver.wallet.keyring.generate()

            const result = caver.wallet.keyring.createFromPrivateKey(keyring.key[0][0].privateKey)
            validateKeyring(result, { expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-006: input: single private key(without 0x-hex prefixed)', () => {
        it('should create Keyring instance from private key string', () => {
            const keyring = caver.wallet.keyring.generate()

            const result = caver.wallet.keyring.createFromPrivateKey(utils.stripHexPrefix(keyring.key[0][0].privateKey))
            validateKeyring(result, { expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-007: input: KlaytnWalletKey string', () => {
        it('should create Keyring instance from KlaytnWalletKey string', () => {
            const keyring = generateDecoupledKeyring()
            const klaytnWalletKey = keyring.getKlaytnWalletKey()

            const result = caver.wallet.keyring.createFromPrivateKey(klaytnWalletKey)
            validateKeyring(result, { expectedKey: keyring.key, expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-008: input: KlaytnWalletKey string(without 0x-hex prefixed)', () => {
        it('should create Keyring instance from KlaytnWalletKey string', () => {
            const keyring = generateDecoupledKeyring()
            const klaytnWalletKey = keyring.getKlaytnWalletKey()

            const result = caver.wallet.keyring.createFromPrivateKey(utils.stripHexPrefix(klaytnWalletKey))
            validateKeyring(result, { expectedKey: keyring.key, expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-009: input: invalid private key', () => {
        it('should throw error', () => {
            const invalidPrivateKey = caver.utils.randomHex(31)

            const errormsg = `Invalid private key: ${invalidPrivateKey}`

            expect(() => caver.wallet.keyring.createFromPrivateKey(invalidPrivateKey)).to.throws(errormsg)
        })
    })
})

describe('caver.wallet.keyring.createFromKlaytnWalletKey', () => {
    context('CAVERJS-UNIT-KEYRING-010: input: valid KlaytnWalletKey', () => {
        it('should create Keyring instance from KlaytnWalletKey', () => {
            const keyring = generateDecoupledKeyring()
            const klaytnWalletKey = keyring.getKlaytnWalletKey()

            const result = caver.wallet.keyring.createFromKlaytnWalletKey(klaytnWalletKey)
            validateKeyring(result, { expectedKey: keyring.key, expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-011: input: invalid KlaytnWalletKey', () => {
        it('should throw error', () => {
            const invalidPrivateKey = '39d87f15c695ec94d6d7107b48dee85e252f21fedd371e1c6baefbdf0x000x658b7b7a94ac398a8e7275e719a10c'

            const errormsg = `Invalid KlaytnWalletKey: ${invalidPrivateKey}`

            expect(() => caver.wallet.keyring.createFromKlaytnWalletKey(invalidPrivateKey)).to.throws(errormsg)
        })
    })
})

describe('caver.wallet.keyring.create', () => {
    context('CAVERJS-UNIT-KEYRING-012: input: address, single private key string', () => {
        it('should create keyring instances with parameters', () => {
            const keyring = caver.wallet.keyring.generate()
            const created = caver.wallet.keyring.create(keyring.address, keyring.key[0][0].privateKey)

            validateKeyring(created, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-013: input: address, multiple private key strings', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const address = caver.wallet.keyring.generate().address
            const multiplePrivateKeys = [
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
            ]
            const created = caver.wallet.keyring.create(address, multiplePrivateKeys)
            validateKeyring(created, { expectedAddress: address, expectedKey: multiplePrivateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-014: input: address, private keys by roles(without empty role)', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const address = caver.wallet.keyring.generate().address
            const roleBasedPrivateKeys = [
                [
                    caver.wallet.keyring.generatePrivateKey(),
                    caver.wallet.keyring.generatePrivateKey(),
                    caver.wallet.keyring.generatePrivateKey(),
                ],
                [caver.wallet.keyring.generatePrivateKey()],
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
            ]
            const created = caver.wallet.keyring.create(address, roleBasedPrivateKeys)
            validateKeyring(created, { expectedAddress: address, expectedKey: roleBasedPrivateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-015: input: address, private keys by roles(with empty role)', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const address = caver.wallet.keyring.generate().address
            const roleBasedPrivateKeys = [[], [], [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()]]
            const created = caver.wallet.keyring.create(address, roleBasedPrivateKeys)
            validateKeyring(created, { expectedAddress: address, expectedKey: roleBasedPrivateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-016: input: address, invalid key format', () => {
        it('should throw error if key is invalid format', () => {
            const address = caver.wallet.keyring.generate().address
            const invalidKey = [
                caver.wallet.keyring.generatePrivateKey(),
                [],
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
            ]
            const expectedError = `Unsupported key type: ${typeof invalidKey}`

            expect(() => caver.wallet.keyring.create(address, invalidKey)).to.throw(expectedError)
        })
    })
})

describe('caver.wallet.keyring.createWithSingleKey', () => {
    context('CAVERJS-UNIT-KEYRING-017: input: coupled address, private key', () => {
        it('should create Keyring instance', () => {
            const coupled = caver.wallet.keyring.generate()
            const prvString = coupled.key[0][0].privateKey

            const result = caver.wallet.keyring.createWithSingleKey(coupled.address, prvString)

            validateKeyring(result, { expectedKey: prvString, expectedAddress: coupled.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-018: input: decoupled address, private key', () => {
        it('should create Keyring instance', () => {
            const decoupled = generateDecoupledKeyring()
            const prvString = decoupled.key[0][0].privateKey

            const result = caver.wallet.keyring.createWithSingleKey(decoupled.address, prvString)

            validateKeyring(result, { expectedKey: prvString, expectedAddress: decoupled.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-019: input: valid address, valid KlaytnWalletKey', () => {
        it('should throw error', () => {
            const keyring = caver.wallet.keyring.generate()
            const klaytnWalletKey = keyring.getKlaytnWalletKey()

            const errormsg = `Invalid format of parameter. Use 'fromKlaytnWalletKey' to create Keyring from KlaytnWalletKey.`

            expect(() => caver.wallet.keyring.createWithSingleKey(keyring.address, klaytnWalletKey)).to.throws(errormsg)
        })
    })

    context('CAVERJS-UNIT-KEYRING-020: input: valid address, multiple private key array', () => {
        it('should throw error', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()]

            const errormsg = `Invalid format of parameter. Use 'fromMultipleKey' or 'fromRoleBasedKey' for two or more keys.`

            expect(() => caver.wallet.keyring.createWithSingleKey(keyring.address, arr)).to.throws(errormsg)
            expect(() => caver.wallet.keyring.createWithSingleKey(keyring.address, undefined)).to.throws(errormsg)
            expect(() => caver.wallet.keyring.createWithSingleKey(keyring.address, {})).to.throws(errormsg)
            expect(() => caver.wallet.keyring.createWithSingleKey(keyring.address, [])).to.throws(errormsg)
        })
    })
})

describe('caver.wallet.keyring.createWithMultipleKey', () => {
    context('CAVERJS-UNIT-KEYRING-021: input: valid address, valid private key array', () => {
        it('should create Keyring instance', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()]

            const result = caver.wallet.keyring.createWithMultipleKey(keyring.address, arr)
            validateKeyring(result, { expectedKey: arr, expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-022: input: valid address, invalid private key array', () => {
        it('should throw error', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [caver.utils.randomHex(31), caver.utils.randomHex(31)]

            const errormsg = `Invalid private key: ${arr[0]}`

            expect(() => caver.wallet.keyring.createWithMultipleKey(keyring.address, arr)).to.throws(errormsg)
        })
    })

    context('CAVERJS-UNIT-KEYRING-023: input: valid address, invalid format of private key array', () => {
        it('should throw error', () => {
            const keyring = caver.wallet.keyring.generate()
            let arr = [[caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()]]

            const errormsg = `Invalid format of parameter. 'keyArray' should be an array of private key strings.`

            expect(() => caver.wallet.keyring.createWithMultipleKey(keyring.address, arr)).to.throws(errormsg)

            arr = [caver.wallet.keyring.generatePrivateKey(), [caver.wallet.keyring.generatePrivateKey()]]
            expect(() => caver.wallet.keyring.createWithMultipleKey(keyring.address, arr)).to.throws(errormsg)

            expect(() => caver.wallet.keyring.createWithMultipleKey(keyring.address, undefined)).to.throws(errormsg)
            expect(() => caver.wallet.keyring.createWithMultipleKey(keyring.address, {})).to.throws(errormsg)
        })
    })
})

describe('caver.wallet.keyring.createWithRoleBasedKey', () => {
    context('CAVERJS-UNIT-KEYRING-024: input: valid address, valid role based private key array', () => {
        it('should create Keyring instance', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
                [caver.wallet.keyring.generatePrivateKey()],
                [caver.wallet.keyring.generatePrivateKey()],
            ]

            const result = caver.wallet.keyring.createWithRoleBasedKey(keyring.address, arr)
            validateKeyring(result, { expectedKey: arr, expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-025: input: valid address, invalid role based private key format', () => {
        it('should throw error if the role-based key does not define the key to be used for the role in the form of an array.', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
            ]

            const expectedError = `Invalid format of parameter. 'roledBasedKeyArray' should be in the form of an array defined as an array for the keys to be used for each role.`
            expect(() => caver.wallet.keyring.createWithRoleBasedKey(keyring.address, arr)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-026: input: valid address, invalid private key array', () => {
        it('should throw error', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [[caver.utils.randomHex(31), caver.utils.randomHex(31)]]

            const errormsg = `Invalid private key: ${arr[0][0]}`

            expect(() => caver.wallet.keyring.createWithRoleBasedKey(keyring.address, arr)).to.throws(errormsg)
        })
    })

    context('CAVERJS-UNIT-KEYRING-027: input: valid address, invalid format of role based private key array (1 dimensional array)', () => {
        it('should throw error', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()]

            const errormsg = `Invalid format of parameter. 'roledBasedKeyArray' should be in the form of an array defined as an array for the keys to be used for each role.`

            expect(() => caver.wallet.keyring.createWithRoleBasedKey(keyring.address, arr)).to.throws(errormsg)
            expect(() => caver.wallet.keyring.createWithRoleBasedKey(keyring.address, caver.wallet.keyring.generatePrivateKey())).to.throws(
                errormsg
            )
        })
    })
})

describe('caver.wallet.keyring.encrypt', () => {
    context('CAVERJS-UNIT-KEYRING-028: input: private key string, password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const privateKey = caver.wallet.keyring.generatePrivateKey()
            const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)

            const result = caver.wallet.keyring.encrypt(privateKey, password)
            validateKeystore(result, password, { address: keyring.address, expectedKey: privateKey })
        })
    })

    context('CAVERJS-UNIT-KEYRING-029: input: private key string, password, {address}', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const keyring = generateDecoupledKeyring()
            const privateKey = keyring.key[0][0].privateKey

            const result = caver.wallet.keyring.encrypt(privateKey, password, { address: keyring.address })
            validateKeystore(result, password, { address: keyring.address, expectedKey: privateKey })
        })
    })
    context('CAVERJS-UNIT-KEYRING-030: input: klaytnWalletKey, password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const keyring = generateDecoupledKeyring()
            const klaytnWalletKey = keyring.getKlaytnWalletKey()

            const result = caver.wallet.keyring.encrypt(klaytnWalletKey, password)
            validateKeystore(result, password, { address: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-031: input: multiple private key, password, {address}', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const privateKeys = [
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
            ]
            const address = caver.wallet.keyring.generate().address

            const result = caver.wallet.keyring.encrypt(privateKeys, password, { address })
            validateKeystore(result, password, { address, keyringLength: 3, expectedKey: privateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-032: input: multiple private key, password', () => {
        it('should throw error', () => {
            const password = 'password'
            const privateKeys = [
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
            ]

            const errormsg = `The address must be defined inside the options object to encrypt multiple keys.`

            expect(() => caver.wallet.keyring.encrypt(privateKeys, password)).to.throws(errormsg)
        })
    })

    context('CAVERJS-UNIT-KEYRING-033: input: role based private key, password, {address}', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const privateKeys = [
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
                [caver.wallet.keyring.generatePrivateKey()],
                [
                    caver.wallet.keyring.generatePrivateKey(),
                    caver.wallet.keyring.generatePrivateKey(),
                    caver.wallet.keyring.generatePrivateKey(),
                    caver.wallet.keyring.generatePrivateKey(),
                ],
            ]
            const address = caver.wallet.keyring.generate().address

            const result = caver.wallet.keyring.encrypt(privateKeys, password, { address })
            validateKeystore(result, password, { address, keyringLength: [2, 1, 4], expectedKey: privateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-034: input: role based private key(with empty role), password, {address}', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const privateKeys = [
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
                [],
                [caver.wallet.keyring.generatePrivateKey()],
            ]
            const address = caver.wallet.keyring.generate().address

            const result = caver.wallet.keyring.encrypt(privateKeys, password, { address })
            validateKeystore(result, password, { address, keyringLength: [2, 0, 1], expectedKey: privateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-035: input: role based private key, password', () => {
        it('should throw error', () => {
            const password = 'password'
            const privateKeys = [
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
                [caver.wallet.keyring.generatePrivateKey(), caver.wallet.keyring.generatePrivateKey()],
            ]

            const errormsg = `The address must be defined inside the options object to encrypt multiple keys.`

            expect(() => caver.wallet.keyring.encrypt(privateKeys, password)).to.throws(errormsg)
        })
    })

    context('CAVERJS-UNIT-KEYRING-036: input: role based private key, password, option', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const address = '0xf725a2950dc959638fa09f9d9b5426ad3dd8cd90'
            const keys = [
                ['0x7dc66dca0e5d56940c99ad01903a8ba5fd9e1f7a51a8ab07cf81ccd1d3c4be16'],
                [
                    '0x5fc3216454ab841ffa2bed0933a27bcdf2965238372bff3ec4fe56cbf5389a87',
                    '0x79fe0616e7624314611b8e9c716b8d9c0c8c8c20f654021ff5fa7c46dc50709b',
                ],
                ['0xfac188dc156ef58d529ea14ac95379f502a390d5720a9575b87545e36b3f758e'],
            ]
            const keyring = caver.wallet.keyring.createWithRoleBasedKey(address, keys)

            const encryptOption = {
                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                iv: Buffer.from('38aa896fc128075425e512f01e4b206c', 'hex'),
                kdf: 'scrypt',
                dklen: 32,
                n: 4096,
                r: 8,
                p: 1,
                cipher: 'aes-128-ctr',
                uuid: Buffer.from('e7c4605ad8200e0d93cd67f9d82fb997', 'hex'),
            }

            const options = Object.assign({ address }, encryptOption)

            const result = caver.wallet.keyring.encrypt(keyring.key, password, options)

            const expectedKeystore = {
                version: 4,
                id: 'e7c4605a-d820-4e0d-93cd-67f9d82fb997',
                address: '0xf725a2950dc959638fa09f9d9b5426ad3dd8cd90',
                keyring: [
                    [
                        {
                            ciphertext: 'b3126f30cb419a63f367ea2313c3cf1a27ef9f08fc9a5da50aec2b93f5afbef4',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: 'df371741da37e778a820905f5a43f60aabd904ad81012e4c58c9eb7160cde38b',
                        },
                    ],
                    [
                        {
                            ciphertext: '9117239e91b748e805d5aa2bb05b3f7228e7d24a9a19099c0193b189d3539a65',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: 'ded3da00062f4e04b8248c8c6c37299c205b8e48d26c5187586dfa49959a9f9a',
                        },
                        {
                            ciphertext: 'b72a04ec227e8fe39ee5c9bef292c923d6fd0c525b66f4bd30979b04fa3b7079',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '28090ffbce196b3b2640eec40ed2964071ef1a7f5d72f4db279589115a85a94d',
                        },
                    ],
                    [
                        {
                            ciphertext: '34158a26d072397aad60e6684aaa3d4ad8d210a7df3863d77d18a2a14d54756c',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '210d28df835312ff82042b77402a6b105cdb6576a379ebae22076b5c5bfdf66f',
                        },
                    ],
                ],
            }

            function compareEncrypted(ret, exp) {
                expect(ret.ciphertext).to.equals(exp.ciphertext)
                expect(ret.cipherparams.iv).to.equals(exp.cipherparams.iv)
                expect(ret.cipher).to.equals(exp.cipher)
                expect(ret.kdf).to.equals(exp.kdf)
                expect(ret.kdfparams.dklen).to.equals(exp.kdfparams.dklen)
                expect(ret.kdfparams.salt).to.equals(exp.kdfparams.salt)
                expect(ret.kdfparams.n).to.equals(exp.kdfparams.n)
                expect(ret.kdfparams.r).to.equals(exp.kdfparams.r)
                expect(ret.kdfparams.p).to.equals(exp.kdfparams.p)
                expect(ret.mac).to.equals(exp.mac)
            }

            expect(result.version).to.equals(expectedKeystore.version)
            expect(result.id).to.equals(expectedKeystore.id)
            expect(result.address).to.equals(expectedKeystore.address)
            compareEncrypted(result.keyring[0][0], expectedKeystore.keyring[0][0])
            compareEncrypted(result.keyring[1][0], expectedKeystore.keyring[1][0])
            compareEncrypted(result.keyring[1][1], expectedKeystore.keyring[1][1])
            compareEncrypted(result.keyring[2][0], expectedKeystore.keyring[2][0])

            validateKeystore(result, password, { address, keyringLength: [1, 2, 1], expectedKey: keys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-037: input: invalid private key string, password', () => {
        it('should throw error', () => {
            const password = 'password'
            const privateKey = caver.utils.randomHex(31)

            const errormsg = `Invalid private key: ${privateKey}`

            expect(() => caver.wallet.keyring.encrypt(privateKey, password)).to.throws(errormsg)
        })
    })
})

describe('caver.wallet.keyring.encryptV3', () => {
    context('CAVERJS-UNIT-KEYRING-038: input: private key string, password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const privateKey = caver.wallet.keyring.generatePrivateKey()
            const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)

            const result = caver.wallet.keyring.encryptV3(privateKey, password)
            validateKeystore(result, password, { address: keyring.address, expectedKey: privateKey }, 3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-039: input: private key string, password, {address}', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const keyring = generateDecoupledKeyring()
            const privateKey = keyring.key[0][0].privateKey

            const result = caver.wallet.keyring.encryptV3(privateKey, password, { address: keyring.address })
            validateKeystore(result, password, { address: keyring.address, expectedKey: privateKey }, 3)
        })
    })
    context('CAVERJS-UNIT-KEYRING-040: input: klaytnWalletKey, password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const keyring = generateDecoupledKeyring()
            const klaytnWalletKey = keyring.getKlaytnWalletKey()

            const result = caver.wallet.keyring.encryptV3(klaytnWalletKey, password)
            validateKeystore(result, password, { address: keyring.address, expectedKey: keyring.key }, 3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-041: input: multiple private key, password, {address}', () => {
        it('should throw error', () => {
            const password = 'password'
            const privateKeys = [
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
                caver.wallet.keyring.generatePrivateKey(),
            ]
            const address = caver.wallet.keyring.generate().address

            const errormsg = `Invalid parameter. key should be a private key string, KlaytnWalletKey or instance of Keyring`
            expect(() => caver.wallet.keyring.encryptV3(privateKeys, password, { address })).to.throws(errormsg)
        })
    })

    context('CAVERJS-UNIT-KEYRING-042: input: invalid private key string, password', () => {
        it('should throw error', () => {
            const password = 'password'
            const privateKey = caver.utils.randomHex(31)

            const errormsg = `Invalid private key: ${privateKey}`

            expect(() => caver.wallet.keyring.encryptV3(privateKey, password)).to.throws(errormsg)
        })
    })
})

describe('caver.wallet.keyring.decrypt', () => {
    context('CAVERJS-UNIT-KEYRING-043: coupled keyring', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const privateKey = caver.wallet.keyring.generatePrivateKey()
            const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)

            const encrypted = caver.wallet.keyring.encrypt(privateKey, password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-044: decoupled keyring', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keyring = generateDecoupledKeyring()

            const encrypted = keyring.encrypt(password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-045: keyring that uses multiple private key', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keyring = generateMultiSigKeyring()

            const encrypted = keyring.encrypt(password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-046: keyring that uses different private keys by roles', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keyring = generateRoleBasedKeyring()

            const encrypted = keyring.encrypt(password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-047: keyring that uses different private keys by roles with empty role', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keyring = generateRoleBasedKeyring([2, 0, 1])

            const encrypted = keyring.encrypt(password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-048: input: hard coded keystoreJsonV4 that encrypts Account, password', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keystoreJsonV4 = {
                version: 4,
                id: '55da3f9c-6444-4fc1-abfa-f2eabfc57501',
                address: '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
                keyring: [
                    [
                        {
                            ciphertext: '93dd2c777abd9b80a0be8e1eb9739cbf27c127621a5d3f81e7779e47d3bb22f6',
                            cipherparams: { iv: '84f90907f3f54f53d19cbd6ae1496b86' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: '69bf176a136c67a39d131912fb1e0ada4be0ed9f882448e1557b5c4233006e10',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '8f6d1d234f4a87162cf3de0c7fb1d4a8421cd8f5a97b86b1a8e576ffc1eb52d2',
                        },
                        {
                            ciphertext: '53d50b4e86b550b26919d9b8cea762cd3c637dfe4f2a0f18995d3401ead839a6',
                            cipherparams: { iv: 'd7a6f63558996a9f99e7daabd289aa2c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: '966116898d90c3e53ea09e4850a71e16df9533c1f9e1b2e1a9edec781e1ad44f',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: 'bca7125e17565c672a110ace9a25755847d42b81aa7df4bb8f5ce01ef7213295',
                        },
                    ],
                    [
                        {
                            ciphertext: 'f16def98a70bb2dae053f791882f3254c66d63416633b8d91c2848893e7876ce',
                            cipherparams: { iv: 'f5006128a4c53bc02cada64d095c15cf' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: '0d8a2f71f79c4880e43ff0795f6841a24cb18838b3ca8ecaeb0cda72da9a72ce',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '38b79276c3805b9d2ff5fbabf1b9d4ead295151b95401c1e54aed782502fc90a',
                        },
                    ],
                    [
                        {
                            ciphertext: '544dbcc327942a6a52ad6a7d537e4459506afc700a6da4e8edebd62fb3dd55ee',
                            cipherparams: { iv: '05dd5d25ad6426e026818b6fa9b25818' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: '3a9003c1527f65c772c54c6056a38b0048c2e2d58dc0e584a1d867f2039a25aa',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '19a698b51409cc9ac22d63d329b1201af3c89a04a1faea3111eec4ca97f2e00f',
                        },
                        {
                            ciphertext: 'dd6b920f02cbcf5998ed205f8867ddbd9b6b088add8dfe1774a9fda29ff3920b',
                            cipherparams: { iv: 'ac04c0f4559dad80dc86c975d1ef7067' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: '22279c6dbcc706d7daa120022a236cfe149496dca8232b0f8159d1df999569d6',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '1c54f7378fa279a49a2f790a0adb683defad8535a21bdf2f3dadc48a7bddf517',
                        },
                    ],
                ],
            }

            const expectedAccount = caver.wallet.keyring.createWithRoleBasedKey('0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2', [
                [
                    '0xd1e9f8f00ef9f93365f5eabccccb3f3c5783001b61a40f0f74270e50158c163d',
                    '0x4bd8d0b0c1575a7a35915f9af3ef8beb11ad571337ec9b6aca7c88ca7458ef5c',
                ],
                ['0xdc2690ac6017e32ef17ea219c2a2fd14a2bb73e7a0a253dfd69abba3eb8d7d91'],
                [
                    '0xf17bf8b7bee09ffc50a401b7ba8e633b9e55eedcf776782f2a55cf7cc5c40aa8',
                    '0x4f8f1e9e1466609b836dba611a0a24628aea8ee11265f757aa346bde3d88d548',
                ],
            ])

            const decrypted = caver.wallet.keyring.decrypt(keystoreJsonV4, password)

            validateKeyring(decrypted, { expectedAddress: expectedAccount.address, expectedKey: expectedAccount.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-049: input: hard coded keystoreJsonV3 that encrypts Account, password', () => {
        it('should decrypt and return valid account', () => {
            const keystoreJsonV3 = {
                version: 3,
                id: '7a0a8557-22a5-4c90-b554-d6f3b13783ea',
                address: '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
                crypto: {
                    ciphertext: '696d0e8e8bd21ff1f82f7c87b6964f0f17f8bfbd52141069b59f084555f277b7',
                    cipherparams: { iv: '1fd13e0524fa1095c5f80627f1d24cbd' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: '7ee980925cef6a60553cda3e91cb8e3c62733f64579f633d0f86ce050c151e26',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: '8684d8dc4bf17318cd46c85dbd9a9ec5d9b290e04d78d4f6b5be9c413ff30ea4',
                },
            }
            const password = 'password'
            const expectedAccount = caver.wallet.keyring.createWithSingleKey(
                '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
                '0x36e0a792553f94a7660e5484cfc8367e7d56a383261175b9abced7416a5d87df'
            )

            const result = caver.wallet.keyring.decrypt(keystoreJsonV3, password)

            validateKeyring(result, { keys: expectedAccount.keys, address: expectedAccount.address })
        })
    })
})

describe('caver.wallet.keyring.recover', () => {
    let keyring

    beforeEach(() => {
        keyring = caver.wallet.keyring.generate()
    })

    context('CAVERJS-UNIT-KEYRING-050: input: signMessage result object', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const signed = keyring.signMessage(message)

            const result = caver.wallet.keyring.recover(signed)
            expect(result).to.equal(keyring.address)
        })
    })

    context('CAVERJS-UNIT-KEYRING-051: input: message, signature', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const sigObj = keyring.signMessage(message)

            const result = caver.wallet.keyring.recover(sigObj.message, sigObj.signature)
            expect(result).to.equal(keyring.address)
        })
    })

    context('CAVERJS-UNIT-KEYRING-052: input: messageHash, signature, prefixed', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const signed = keyring.signMessage(message)
            const prefixed = true

            const result = caver.wallet.keyring.recover(signed.messageHash, signed.signature, prefixed)
            expect(result).to.equal(keyring.address)
        })
    })
})

describe('keyring.getPublicKey', () => {
    context('CAVERJS-UNIT-KEYRING-053: keyring type: coupled', () => {
        it('return single public key with roled form', () => {
            const keyring = caver.wallet.keyring.generate()
            const pubKey = keyring.getPublicKey()

            expect(pubKey[0][0]).to.equal(keyring.key[0][0].getPublicKey())
            expect(pubKey[0].length).to.equal(1)
            expect(pubKey[1].length).to.equal(0)
            expect(pubKey[2].length).to.equal(0)
        })
    })

    context('CAVERJS-UNIT-KEYRING-054: keyring type: decoupled', () => {
        it('return single public key with roled form', () => {
            const keyring = generateDecoupledKeyring()
            const pubKey = keyring.getPublicKey()

            expect(pubKey[0][0]).to.equal(keyring.key[0][0].getPublicKey())
            expect(pubKey[0].length).to.equal(1)
            expect(pubKey[1].length).to.equal(0)
            expect(pubKey[2].length).to.equal(0)
        })
    })

    context('CAVERJS-UNIT-KEYRING-055: keyring type: multiple keys', () => {
        it('return multiple public keys with roled form', () => {
            const keyring = generateMultiSigKeyring(2)
            const pubKey = keyring.getPublicKey()

            expect(pubKey[0][0]).to.equal(keyring.key[0][0].getPublicKey())
            expect(pubKey[0][1]).to.equal(keyring.key[0][1].getPublicKey())
            expect(pubKey[0].length).to.equal(2)
            expect(pubKey[1].length).to.equal(0)
            expect(pubKey[2].length).to.equal(0)
        })
    })

    context('CAVERJS-UNIT-KEYRING-056: keyring type: role based keys', () => {
        it('return role based public keys with roled form', () => {
            const keyring = generateRoleBasedKeyring([2, 3, 1])
            const pubKey = keyring.getPublicKey()

            expect(pubKey[0][0]).to.equal(keyring.key[0][0].getPublicKey())
            expect(pubKey[0][1]).to.equal(keyring.key[0][1].getPublicKey())
            expect(pubKey[1][0]).to.equal(keyring.key[1][0].getPublicKey())
            expect(pubKey[1][1]).to.equal(keyring.key[1][1].getPublicKey())
            expect(pubKey[1][2]).to.equal(keyring.key[1][2].getPublicKey())
            expect(pubKey[2][0]).to.equal(keyring.key[2][0].getPublicKey())
            expect(pubKey[0].length).to.equal(2)
            expect(pubKey[1].length).to.equal(3)
            expect(pubKey[2].length).to.equal(1)
        })
    })
})

describe('keyring.copy', () => {
    context('CAVERJS-UNIT-KEYRING-057: keyring type: coupled', () => {
        it('return copied coupled keyring', () => {
            const keyring = caver.wallet.keyring.generate()
            const copied = keyring.copy()

            validateKeyring(copied, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-058: keyring type: decoupled', () => {
        it('return copied decoupled keyring', () => {
            const keyring = generateDecoupledKeyring()
            const copied = keyring.copy()

            validateKeyring(copied, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-059: keyring type: multiple keys', () => {
        it('return copied keyring which uses multiple keys', () => {
            const keyring = generateMultiSigKeyring(2)
            const copied = keyring.copy()

            validateKeyring(copied, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-060: keyring type: role based keys', () => {
        it('return copied keyring which uses different keys by roles', () => {
            const keyring = generateRoleBasedKeyring([2, 3, 1])
            const copied = keyring.copy()

            validateKeyring(copied, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })
})

describe('keyring.signWithKey', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased
    const hash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'
    const chainId = 10000

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([3, 0, 3])
    })

    context('CAVERJS-UNIT-KEYRING-061: keyring type: coupled / role: existed role / index: undefined', () => {
        it('return one signature array', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'sign')
            const signed = coupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-062: keyring type: coupled / role: existed role / index: 0', () => {
        it('return one signature array', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'sign')
            const signed = coupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-063: keyring type: coupled / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'sign')
            const signed = coupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-064: keyring type: coupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 1
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${coupled.key[0].length}).`
            expect(() => coupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-KEYRING-065: keyring type: decoupled / role: existed role / index: undefined', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'sign')
            const signed = decoupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-066: keyring type: decoupled / role: existed role / index: 0', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'sign')
            const signed = decoupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-067: keyring type: decoupled / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'sign')
            const signed = decoupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-068: keyring type: decoupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = decoupled.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${decoupled.key[0].length}).`
            expect(() => decoupled.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-KEYRING-069: keyring type: multiSig / role: existed role / index: undefined', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(multiSig.key[0][0], 'sign')
            const signed = multiSig.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-070: keyring type: multiSig / role: existed role / index: 2', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(multiSig.key[0][2], 'sign')
            const signed = multiSig.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-071: keyring type: multiSig / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(multiSig.key[0][0], 'sign')
            const signed = multiSig.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-072: keyring type: multiSig / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = multiSig.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${multiSig.key[0].length}).`
            expect(() => multiSig.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-KEYRING-073: keyring type: roleBased / role: existed role / index: undefined', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(roleBased.key[0][0], 'sign')
            const signed = roleBased.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-074: keyring type: roleBased / role: existed role / index: 2', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(roleBased.key[2][2], 'sign')
            const signed = roleBased.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_FEE_PAYER_KEY, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-075: keyring type: roleBased / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(roleBased.key[0][0], 'sign')
            const signed = roleBased.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-076: keyring type: roleBased / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = roleBased.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${roleBased.key[0].length}).`
            expect(() => roleBased.signWithKey(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(
                expectedError
            )
        })
    })
})

describe('keyring.signWithKeys', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased
    const hash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'
    const chainId = 10000

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([3, 0, 3])
    })

    context('CAVERJS-UNIT-KEYRING-077: keyring type: coupled / role: existed role', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'sign')
            const signed = coupled.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(1)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-078: keyring type: coupled / role: not existed role', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'sign')
            const signed = coupled.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(1)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-079: keyring type: decoupled / role: existed role', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'sign')
            const signed = decoupled.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(1)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-080: keyring type: decoupled / role: not existed role', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'sign')
            const signed = decoupled.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(1)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-081: keyring type: multiSig / role: existed role', () => {
        it('return return one signature array', () => {
            const signSpy0 = sinon.spy(multiSig.key[0][0], 'sign')
            const signSpy1 = sinon.spy(multiSig.key[0][1], 'sign')
            const signSpy2 = sinon.spy(multiSig.key[0][2], 'sign')
            const signed = multiSig.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(signSpy0).to.have.been.calledOnce
            expect(signSpy1).to.have.been.calledOnce
            expect(signSpy2).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
            expect(_.isArray(signed[1])).to.be.true
            expect(signed[1].length).to.equal(3)
            expect(_.isArray(signed[2])).to.be.true
            expect(signed[2].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-082: keyring type: multiSig / role: not existed role', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy0 = sinon.spy(multiSig.key[0][0], 'sign')
            const signSpy1 = sinon.spy(multiSig.key[0][1], 'sign')
            const signSpy2 = sinon.spy(multiSig.key[0][2], 'sign')
            const signed = multiSig.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY)

            expect(signSpy0).to.have.been.calledOnce
            expect(signSpy1).to.have.been.calledOnce
            expect(signSpy2).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
            expect(_.isArray(signed[1])).to.be.true
            expect(signed[1].length).to.equal(3)
            expect(_.isArray(signed[2])).to.be.true
            expect(signed[2].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-083: keyring type: roleBased / role: existed role', () => {
        it('return return one signature array', () => {
            const signSpy0 = sinon.spy(roleBased.key[2][0], 'sign')
            const signSpy1 = sinon.spy(roleBased.key[2][1], 'sign')
            const signSpy2 = sinon.spy(roleBased.key[2][2], 'sign')
            const signed = roleBased.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_FEE_PAYER_KEY)

            expect(signSpy0).to.have.been.calledOnce
            expect(signSpy1).to.have.been.calledOnce
            expect(signSpy2).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
            expect(_.isArray(signed[1])).to.be.true
            expect(signed[1].length).to.equal(3)
            expect(_.isArray(signed[2])).to.be.true
            expect(signed[2].length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-084: keyring type: roleBased / role: not existed role', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy0 = sinon.spy(roleBased.key[0][0], 'sign')
            const signSpy1 = sinon.spy(roleBased.key[0][1], 'sign')
            const signSpy2 = sinon.spy(roleBased.key[0][2], 'sign')
            const signed = roleBased.signWithKeys(hash, chainId, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY)

            expect(signSpy0).to.have.been.calledOnce
            expect(signSpy1).to.have.been.calledOnce
            expect(signSpy2).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed.length).to.equal(3)
            expect(_.isArray(signed[0])).to.be.true
            expect(signed[0].length).to.equal(3)
            expect(_.isArray(signed[1])).to.be.true
            expect(signed[1].length).to.equal(3)
            expect(_.isArray(signed[2])).to.be.true
            expect(signed[2].length).to.equal(3)
        })
    })
})

describe('keyring.signMessage', () => {
    const data = 'Some data'
    let coupled
    let decoupled
    let multiSig
    let roleBased

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([3, 0, 3])
    })

    context('CAVERJS-UNIT-KEYRING-085: keyring type: coupled / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'signMessage')
            const signed = coupled.signMessage(data)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-086: keyring type: coupled / role: existed role / index: 0', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'signMessage')
            const signed = coupled.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-087: keyring type: coupled / role: not existed role / index: 0', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(coupled.key[0][0], 'signMessage')
            const signed = coupled.signMessage(data, caver.wallet.keyring.role.ROLE_FEE_PAYER_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-088: keyring type: coupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = coupled.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${coupled.key[0].length}).`
            expect(() => coupled.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-089: keyring type: decoupled / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'signMessage')
            const signed = decoupled.signMessage(data)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-090: keyring type: decoupled / role: existed role / index: 0', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'signMessage')
            const signed = decoupled.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-091: keyring type: decoupled / role: not existed role / index: 0', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(decoupled.key[0][0], 'signMessage')
            const signed = decoupled.signMessage(data, caver.wallet.keyring.role.ROLE_FEE_PAYER_KEY, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-092: keyring type: decoupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = decoupled.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${decoupled.key[0].length}).`
            expect(() => decoupled.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-093: keyring type: multiSig / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const signSpy = sinon.spy(multiSig.key[0][0], 'signMessage')
            const signed = multiSig.signMessage(data)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-094: keyring type: multiSig / role: existed role / index: 1', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(multiSig.key[0][1], 'signMessage')
            const signed = multiSig.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 1)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-095: keyring type: multiSig / role: not existed role / index: 2', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(multiSig.key[0][2], 'signMessage')
            const signed = multiSig.signMessage(data, caver.wallet.keyring.role.ROLE_FEE_PAYER_KEY, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-096: keyring type: multiSig / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = multiSig.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${multiSig.key[0].length}).`
            expect(() => multiSig.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-097: keyring type: roleBased / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const signSpy = sinon.spy(roleBased.key[0][0], 'signMessage')
            const signed = roleBased.signMessage(data)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-098: keyring type: roleBased / role: existed role / index: 1', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(roleBased.key[0][1], 'signMessage')
            const signed = roleBased.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, 1)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-099: keyring type: roleBased / role: not existed role / index: 2', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(roleBased.key[0][2], 'signMessage')
            const signed = roleBased.signMessage(data, caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signature)).to.be.true
            expect(signed.signature.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-100: keyring type: roleBased / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = roleBased.key[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${roleBased.key[0].length}).`
            expect(() => roleBased.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-101: keyring type: roleBased / role: existed role', () => {
        it('should throw error when index or role is undefined', () => {
            const expectedError =
                `To sign message, both role and index must be defined. ` +
                `If both role and index are not defined, this function signs the message using the default key(${
                    caver.wallet.keyring.role[0]
                }[0]).`
            expect(() => roleBased.signMessage(data, caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-102: keyring type: roleBased / index: valid index', () => {
        it('should throw error when index or role is undefined', () => {
            const expectedError =
                `To sign message, both role and index must be defined. ` +
                `If both role and index are not defined, this function signs the message using the default key(${
                    caver.wallet.keyring.role[0]
                }[0]).`
            expect(() => roleBased.signMessage(data, 0)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-103: keyring type: roleBased', () => {
        it('should throw error when default key is empty', () => {
            const emptyDefaultKeyRoleBased = generateRoleBasedKeyring([0, 0, 3])
            const expectedError = `Dafault key(${caver.wallet.keyring.role[0]}) does not have enough key to sign.`
            expect(() => emptyDefaultKeyRoleBased.signMessage(data)).to.throw(expectedError)
        })
    })
})

describe('keyring.getKeyByRole', () => {
    let multiSig
    let roleBased
    let withoutDefaultKey

    beforeEach(() => {
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([3, 4, 5])
        withoutDefaultKey = generateRoleBasedKeyring([0, 0, 5])
    })

    context('CAVERJS-UNIT-KEYRING-104: role: existed role', () => {
        it('return roled key', () => {
            const roledKey = roleBased.getKeyByRole(caver.wallet.keyring.role.ROLE_TRANSACTION_KEY)

            expect(roledKey).not.to.be.undefined
            expect(roledKey.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-105: role: not existed role', () => {
        it('return default roled key', () => {
            const roledKey = multiSig.getKeyByRole(caver.wallet.keyring.role.ROLE_FEE_PAYER_KEY)

            expect(roledKey).not.to.be.undefined
            expect(roledKey.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-106: role: undefined', () => {
        it('should throw error when role is undefined', () => {
            const expectedError = `role should be defined.`

            expect(() => multiSig.getKeyByRole()).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-107: role: not existed role / default role key is empty', () => {
        it('should throw error when default role key is undefined', () => {
            const expectedError = `The key with ${
                caver.wallet.keyring.role[caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY]
            } role does not exist. The ${caver.wallet.keyring.role[0]} for the default role is also empty.`

            expect(() => withoutDefaultKey.getKeyByRole(caver.wallet.keyring.role.ROLE_ACCOUNT_UPDATE_KEY)).to.throw(expectedError)
        })
    })
})

describe('keyring.getKlaytnWalletKey', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([1, 1, 1])
    })

    context('CAVERJS-UNIT-KEYRING-108: keyring type: coupled', () => {
        it('return valid KlaytnWalletKey', () => {
            const klaytnWalletKey = coupled.getKlaytnWalletKey()

            expect(klaytnWalletKey).to.equal(`${coupled.key[0][0].privateKey}0x00${coupled.address}`)
        })
    })

    context('CAVERJS-UNIT-KEYRING-109: keyring type: decoupled', () => {
        it('return valid KlaytnWalletKey', () => {
            const klaytnWalletKey = decoupled.getKlaytnWalletKey()

            expect(klaytnWalletKey).to.equal(`${decoupled.key[0][0].privateKey}0x00${decoupled.address}`)
        })
    })

    context('CAVERJS-UNIT-KEYRING-110: keyring type: multiSig', () => {
        it('should throw error when keyring has multiple keys', () => {
            const expectedError = `The keyring cannot be exported in KlaytnWalletKey format. Use caver.wallet.keyring.encrypt or keyring.encrypt.`

            expect(() => multiSig.getKlaytnWalletKey()).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-111: keyring type: roleBased', () => {
        it('should throw error when keyring has multiple keys', () => {
            const expectedError = `The keyring cannot be exported in KlaytnWalletKey format. Use caver.wallet.keyring.encrypt or keyring.encrypt.`

            expect(() => roleBased.getKlaytnWalletKey()).to.throw(expectedError)
        })
    })
})

describe('keyring.toAccount', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([2, 2, 4])
    })

    context('CAVERJS-UNIT-KEYRING-112: keyring type: empty keyring', () => {
        it('should throw error when key in keyring is empty', () => {
            const empty = caver.wallet.keyring.generate()
            empty.key = null

            const expectedError = `Failed to create Account instance: Empty key in keyring.`

            expect(() => empty.toAccount()).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-113: keyring type: coupled / options: undefined', () => {
        it('return account instance which has AccountKeyPublic', () => {
            const account = coupled.toAccount()

            validateAccount(account, { keyring: coupled, expectedAccountKey: 'AccountKeyPublic' })
        })
    })

    context('CAVERJS-UNIT-KEYRING-114: keyring type: coupled / options: empty object defined', () => {
        it('should throw error if options is defined with single key', () => {
            const expectedError = `options cannot be defined with single key.`

            expect(() => coupled.toAccount({})).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-115: keyring type: coupled / options: valid object defined', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = { threshold: 3, weight: [3] }

            const account = coupled.toAccount(options)

            validateAccount(account, { keyring: coupled, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-KEYRING-116: keyring type: decoupled / options: undefined', () => {
        it('return account instance which has AccountKeyPublic', () => {
            const account = decoupled.toAccount()

            validateAccount(account, { keyring: decoupled, expectedAccountKey: 'AccountKeyPublic' })
        })
    })

    context('CAVERJS-UNIT-KEYRING-117: keyring type: decoupled / options: empty object defined', () => {
        it('should throw error if options is defined with single key', () => {
            const expectedError = `options cannot be defined with single key.`

            expect(() => decoupled.toAccount({})).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-118: keyring type: decoupled / options: valid object defined', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = { threshold: 3, weight: [3] }

            const account = decoupled.toAccount(options)

            validateAccount(account, { keyring: decoupled, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-KEYRING-119: keyring type: multiSig / options: undefined', () => {
        it('return account instance which has AccountKeyWeightedMultiSig with default options', () => {
            const account = multiSig.toAccount()
            const exepectedOptions = { threshold: 1, weight: [1, 1, 1] }
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-120: keyring type: multiSig / options: defined', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = { threshold: 5, weight: [2, 3, 4] }
            const account = multiSig.toAccount(options)
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-KEYRING-121: keyring type: multiSig / options: defined(empty array format)', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = []
            const exepectedOptions = { threshold: 1, weight: [1, 1, 1] }
            const account = multiSig.toAccount(options)
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-122: keyring type: multiSig / options: defined(array of empty object format)', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = [{}, {}, {}]
            const exepectedOptions = { threshold: 1, weight: [1, 1, 1] }
            const account = multiSig.toAccount(options)
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-123: keyring type: multiSig / options: defined(array format)', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = [{ threshold: 5, weight: [2, 3, 4] }, {}, {}]
            const account = multiSig.toAccount(options)
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options[0] })
        })
    })

    context('CAVERJS-UNIT-KEYRING-124: keyring type: roleBased / options: undefined', () => {
        it('return account instance which has AccountKeyRoleBased with default options', () => {
            const account = roleBased.toAccount()
            const exepectedOptions = [
                { threshold: 1, weight: [1, 1] },
                { threshold: 1, weight: [1, 1] },
                { threshold: 1, weight: [1, 1, 1, 1] },
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-125: keyring type: roleBased / options: defined', () => {
        it('return account instance which has AccountKeyRoleBased', () => {
            const options = [{ threshold: 2, weight: [1, 1] }, { threshold: 2, weight: [1, 2] }, { threshold: 5, weight: [1, 2, 3, 4] }]
            const account = roleBased.toAccount(options)
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-KEYRING-126: keyring type: roleBased / options: empty array', () => {
        it('return account instance which has AccountKeyRoleBased with default options', () => {
            const account = roleBased.toAccount([])
            const exepectedOptions = [
                { threshold: 1, weight: [1, 1] },
                { threshold: 1, weight: [1, 1] },
                { threshold: 1, weight: [1, 1, 1, 1] },
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-127: keyring type: roleBased / options: array of empty object', () => {
        it('return account instance which has AccountKeyRoleBased with default options', () => {
            const account = roleBased.toAccount([{}, {}, {}])
            const exepectedOptions = [
                { threshold: 1, weight: [1, 1] },
                { threshold: 1, weight: [1, 1] },
                { threshold: 1, weight: [1, 1, 1, 1] },
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-128: keyring type: roleBased / options: defined(not array format)', () => {
        it('should throw error when options is insufficient', () => {
            const options = { threshold: 5, weight: [2, 3, 4] }
            const expectedError = `options should define threshold and weight for each roles in an array format`

            expect(() => roleBased.toAccount(options)).to.throw(expectedError)
        })
    })
})

describe('keyring.encrypt', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([2, 2, 4])
    })

    context('CAVERJS-UNIT-KEYRING-129: keyring type: coupled, input: password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const result = coupled.encrypt(password)
            validateKeystore(result, password, { address: coupled.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-130: keyring type: decoupled, input: password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const result = decoupled.encrypt(password)
            validateKeystore(result, password, { address: decoupled.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-131: keyring type: multiSig, input: password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const result = multiSig.encrypt(password)
            validateKeystore(result, password, { address: multiSig.address, keyringLength: 3 })
        })
    })

    context('CAVERJS-UNIT-KEYRING-132: keyring type: roleBased, input: password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const result = roleBased.encrypt(password)
            validateKeystore(result, password, { address: roleBased.address, keyringLength: [2, 2, 4] })
        })
    })
})

describe('keyring.encryptV3', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([2, 2, 4])
    })

    context('CAVERJS-UNIT-KEYRING-133: keyring type: coupled, input: password', () => {
        it('should encrypted as v3Keystore', () => {
            const password = 'password'
            const result = coupled.encryptV3(password)
            validateKeystore(result, password, { address: coupled.address }, 3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-134: keyring type: decoupled, input: password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'password'
            const result = decoupled.encryptV3(password)
            validateKeystore(result, password, { address: decoupled.address }, 3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-135: keyring type: multiSig, input: password', () => {
        it('should throw error when keyring use multiple private key', () => {
            const password = 'password'
            const expectedError = `This keyring cannot be encrypted keystore v3. use 'keyring.encrypt(password)'.`
            expect(() => multiSig.encryptV3(password)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-136: keyring type: roleBased, input: password', () => {
        it('should throw error when keyring use different private keys by roles', () => {
            const password = 'password'
            const expectedError = `This keyring cannot be encrypted keystore v3. use 'keyring.encrypt(password)'.`
            expect(() => roleBased.encryptV3(password)).to.throw(expectedError)
        })
    })
})
