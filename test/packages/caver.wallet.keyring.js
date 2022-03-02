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

const Caver = require('../../index')
const SingleKeyring = require('../../packages/caver-wallet/src/keyring/singleKeyring')
const MultipleKeyring = require('../../packages/caver-wallet/src/keyring/multipleKeyring')
const RoleBasedKeyring = require('../../packages/caver-wallet/src/keyring/roleBasedKeyring')
const Account = require('../../packages/caver-account')
const AccountKeyPublic = require('../../packages/caver-account/src/accountKey/accountKeyPublic')
const AccountKeyWeightedMultiSig = require('../../packages/caver-account/src/accountKey/accountKeyWeightedMultiSig')
const AccountKeyRoleBased = require('../../packages/caver-account/src/accountKey/accountKeyRoleBased')
const PrivateKey = require('../../packages/caver-wallet/src/keyring/privateKey')
const SignatureData = require('../../packages/caver-wallet/src/keyring/signatureData')

const { generateDecoupledKeyring, generateMultiSigKeyring, generateRoleBasedKeyring } = require('./utils')
const utils = require('../../packages/caver-utils')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

function validateKeyring(data, { expectedAddress, expectedKey } = {}) {
    expect(data instanceof SingleKeyring || data instanceof MultipleKeyring || data instanceof RoleBasedKeyring).to.be.true
    const objectKeys = ['_address']

    if (data instanceof SingleKeyring) {
        objectKeys.push('_key')
    } else {
        objectKeys.push('_keys')
    }

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    if (expectedAddress !== undefined) {
        expect(data.address.toLowerCase()).to.equal(expectedAddress.toLowerCase())
    }

    if (expectedKey !== undefined) {
        if (data instanceof SingleKeyring) {
            comparePrivateKey(expectedKey, data.key)
        } else if (data instanceof MultipleKeyring) {
            for (let i = 0; i < data.keys.length; i++) {
                comparePrivateKey(expectedKey[i], data.keys[i])
            }
        } else {
            for (let i = 0; i < data.keys.length; i++) {
                for (let j = 0; j < data.keys[i].length; j++) {
                    comparePrivateKey(expectedKey[i][j], data.keys[i][j])
                }
            }
        }
    }
}

function comparePrivateKey(expected, actual) {
    const privateKeyString = expected instanceof PrivateKey ? expected.privateKey : expected
    expect(actual.privateKey.toLowerCase()).to.equal(privateKeyString.toLowerCase())
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
                validateAccountKeyPublic(data.accountKey, keyring.key)
                break
            case 'AccountKeyWeightedMultiSig':
                validateAccountKeyWeightedMultiSig(data.accountKey, keyring.keys, exepectedOptions)
                break
            case 'AccountKeyRoleBased':
                expect(data.accountKey instanceof AccountKeyRoleBased).to.be.true
                for (let i = 0; i < data.accountKey.accountKeys.length; i++) {
                    const acctKey = data.accountKey.accountKeys[i]
                    if (acctKey instanceof AccountKeyPublic) {
                        validateAccountKeyPublic(acctKey, keyring.keys[i])
                    } else {
                        validateAccountKeyWeightedMultiSig(acctKey, keyring.keys[i], exepectedOptions[i])
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
            expect(key.weightedPublicKeys[i].weight).to.equal(options.weights[i])
        }
    }
}

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

describe('caver.wallet.generateSingleKey', () => {
    context('CAVERJS-UNIT-KEYRING-147: input: no parameter', () => {
        it('should return valid private key string', () => {
            const result = caver.wallet.keyring.generateSingleKey()
            expect(utils.isValidPrivateKey(result)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-148: input: entropy', () => {
        it('should return valid private key string', () => {
            const entropy = caver.utils.randomHex(32)

            const result = caver.wallet.keyring.generateSingleKey(entropy)
            expect(utils.isValidPrivateKey(result)).to.be.true
        })
    })
})

describe('caver.wallet.generateMultipleKeys', () => {
    context('CAVERJS-UNIT-KEYRING-149: input: number of keys', () => {
        it('should return valid an array of private key strings', () => {
            const result = caver.wallet.keyring.generateMultipleKeys(3)
            expect(result.length).to.be.equal(3)
            for (const p of result) {
                expect(utils.isValidPrivateKey(p)).to.be.true
            }
        })
    })

    context('CAVERJS-UNIT-KEYRING-150: input: number of keys, entropy', () => {
        it('should return valid an array of private key strings', () => {
            const entropy = caver.utils.randomHex(32)

            const result = caver.wallet.keyring.generateMultipleKeys(3, entropy)
            expect(result.length).to.be.equal(3)
            for (const p of result) {
                expect(utils.isValidPrivateKey(p)).to.be.true
            }
        })
    })

    context('CAVERJS-UNIT-KEYRING-151: input: no parameter', () => {
        it('should return error', () => {
            const expectedError = `To generate random multiple private keys, the number of keys should be defined.`
            expect(() => caver.wallet.keyring.generateMultipleKeys()).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-152: input: entropy', () => {
        it('should return error', () => {
            const entropy = caver.utils.randomHex(32)
            const expectedError = `To generate random multiple private keys, the number of keys should be defined.`
            expect(() => caver.wallet.keyring.generateMultipleKeys(entropy)).to.throw(expectedError)
        })
    })
})

describe('caver.wallet.generateRoleBasedKeys', () => {
    context('CAVERJS-UNIT-KEYRING-153: input: an array of the number of keys(less than role)', () => {
        it('should return valid a role-based private key strings', () => {
            const result = caver.wallet.keyring.generateRoleBasedKeys([3])

            expect(result.length).to.be.equal(3)
            expect(result[0].length).to.be.equal(3)
            expect(result[1].length).to.be.equal(0)
            expect(result[2].length).to.be.equal(0)

            for (const p of result[0]) {
                expect(utils.isValidPrivateKey(p)).to.be.true
            }
        })
    })

    context('CAVERJS-UNIT-KEYRING-154: input: an array of the number of keys', () => {
        it('should return valid a role-based private key strings', () => {
            const result = caver.wallet.keyring.generateRoleBasedKeys([3, 1, 2])

            expect(result.length).to.be.equal(3)
            expect(result[0].length).to.be.equal(3)
            expect(result[1].length).to.be.equal(1)
            expect(result[2].length).to.be.equal(2)

            for (let i = 0; i < result.length; i++) {
                for (const p of result[i]) {
                    expect(utils.isValidPrivateKey(p)).to.be.true
                }
            }
        })
    })

    context('CAVERJS-UNIT-KEYRING-155: input: number of keys, entropy', () => {
        it('should return valid a role-based private key strings', () => {
            const entropy = caver.utils.randomHex(32)

            const result = caver.wallet.keyring.generateRoleBasedKeys([2, 2, 2], entropy)

            expect(result.length).to.be.equal(3)
            expect(result[0].length).to.be.equal(2)
            expect(result[1].length).to.be.equal(2)
            expect(result[2].length).to.be.equal(2)

            for (let i = 0; i < result.length; i++) {
                for (const p of result[i]) {
                    expect(utils.isValidPrivateKey(p)).to.be.true
                }
            }
        })
    })

    context('CAVERJS-UNIT-KEYRING-156: input: no parameter', () => {
        it('should return error', () => {
            const expectedError = `To generate random role-based private keys, an array containing the number of keys for each role should be defined.`
            expect(() => caver.wallet.keyring.generateRoleBasedKeys()).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-157: input: entropy', () => {
        it('should return error', () => {
            const entropy = caver.utils.randomHex(32)
            const expectedError = `To generate random role-based private keys, an array containing the number of keys for each role should be defined.`
            expect(() => caver.wallet.keyring.generateRoleBasedKeys(entropy)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-158: input: not array', () => {
        it('should return error', () => {
            const expectedError = `To generate random role-based private keys, an array containing the number of keys for each role should be defined.`
            expect(() => caver.wallet.keyring.generateRoleBasedKeys(3)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-159: input: too long array', () => {
        it('should return error', () => {
            const expectedError = `Unsupported role. The length of array should be less than ${caver.wallet.keyring.role.roleLast}.`
            expect(() => caver.wallet.keyring.generateRoleBasedKeys([1, 1, 1, 1, 1])).to.throw(expectedError)
        })
    })
})

describe('caver.wallet.keyring.createFromPrivateKey', () => {
    context('CAVERJS-UNIT-KEYRING-005: input: single private key', () => {
        it('should create Keyring instance from private key string', () => {
            const keyring = caver.wallet.keyring.generate()

            const result = caver.wallet.keyring.createFromPrivateKey(keyring.key.privateKey)
            validateKeyring(result, { expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-006: input: single private key(without 0x-hex prefixed)', () => {
        it('should create Keyring instance from private key string', () => {
            const keyring = caver.wallet.keyring.generate()

            const result = caver.wallet.keyring.createFromPrivateKey(utils.stripHexPrefix(keyring.key.privateKey))
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
            const created = caver.wallet.keyring.create(keyring.address, keyring.key.privateKey)

            validateKeyring(created, { expectedAddress: keyring.address, expectedKey: keyring.key })
        })
    })

    context('CAVERJS-UNIT-KEYRING-013: input: address, multiple private key strings', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const address = caver.wallet.keyring.generate().address
            const multiplePrivateKeys = caver.wallet.keyring.generateMultipleKeys(3)
            const created = caver.wallet.keyring.create(address, multiplePrivateKeys)
            validateKeyring(created, { expectedAddress: address, expectedKey: multiplePrivateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-014: input: address, private keys by roles(without empty role)', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const address = caver.wallet.keyring.generate().address
            const roleBasedPrivateKeys = caver.wallet.keyring.generateRoleBasedKeys([3, 1, 2])
            const created = caver.wallet.keyring.create(address, roleBasedPrivateKeys)
            validateKeyring(created, { expectedAddress: address, expectedKey: roleBasedPrivateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-015: input: address, private keys by roles(with empty role)', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const address = caver.wallet.keyring.generate().address
            const roleBasedPrivateKeys = caver.wallet.keyring.generateRoleBasedKeys([0, 0, 2])
            const created = caver.wallet.keyring.create(address, roleBasedPrivateKeys)
            validateKeyring(created, { expectedAddress: address, expectedKey: roleBasedPrivateKeys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-016: input: address, invalid key format', () => {
        it('should throw error if key is invalid format', () => {
            const address = caver.wallet.keyring.generate().address
            const invalidKey = [
                caver.wallet.keyring.generateSingleKey(),
                [],
                [caver.wallet.keyring.generateSingleKey(), caver.wallet.keyring.generateSingleKey()],
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
            const prvString = coupled.key.privateKey

            const result = caver.wallet.keyring.createWithSingleKey(coupled.address, prvString)

            validateKeyring(result, { expectedKey: prvString, expectedAddress: coupled.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-018: input: decoupled address, private key', () => {
        it('should create Keyring instance', () => {
            const decoupled = generateDecoupledKeyring()
            const prvString = decoupled.key.privateKey

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
            const arr = caver.wallet.keyring.generateMultipleKeys(2)

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
            const arr = caver.wallet.keyring.generateMultipleKeys(2)

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
            let arr = caver.wallet.keyring.generateRoleBasedKeys([2])

            const errormsg = `Invalid format of parameter. 'keyArray' should be an array of private key strings.`

            expect(() => caver.wallet.keyring.createWithMultipleKey(keyring.address, arr)).to.throws(errormsg)

            arr = [caver.wallet.keyring.generateSingleKey(), [caver.wallet.keyring.generateSingleKey()]]
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
            const arr = caver.wallet.keyring.generateRoleBasedKeys([2, 1, 1])

            const result = caver.wallet.keyring.createWithRoleBasedKey(keyring.address, arr)
            validateKeyring(result, { expectedKey: arr, expectedAddress: keyring.address })
        })
    })

    context('CAVERJS-UNIT-KEYRING-025: input: valid address, invalid role based private key format', () => {
        it('should throw error if the role-based key does not define the key to be used for the role in the form of an array.', () => {
            const keyring = caver.wallet.keyring.generate()
            const arr = [
                [caver.wallet.keyring.generateSingleKey(), caver.wallet.keyring.generateSingleKey()],
                caver.wallet.keyring.generateSingleKey(),
                caver.wallet.keyring.generateSingleKey(),
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
            const arr = caver.wallet.keyring.generateMultipleKeys(2)

            const errormsg = `Invalid format of parameter. 'roledBasedKeyArray' should be in the form of an array defined as an array for the keys to be used for each role.`

            expect(() => caver.wallet.keyring.createWithRoleBasedKey(keyring.address, arr)).to.throws(errormsg)
            expect(() => caver.wallet.keyring.createWithRoleBasedKey(keyring.address, caver.wallet.keyring.generateSingleKey())).to.throws(
                errormsg
            )
        })
    })
})

describe('caver.wallet.keyring.decrypt', () => {
    context('CAVERJS-UNIT-KEYRING-043: coupled keyring', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const privateKey = caver.wallet.keyring.generateSingleKey()
            const keyring = caver.wallet.keyring.createFromPrivateKey(privateKey)

            const encrypted = keyring.encrypt(password)
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

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.keys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-046: keyring that uses different private keys by roles', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keyring = generateRoleBasedKeyring()

            const encrypted = keyring.encrypt(password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.keys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-047: keyring that uses different private keys by roles with empty role', () => {
        it('should return valid keyring', () => {
            const password = 'password'
            const keyring = generateRoleBasedKeyring([2, 0, 1])

            const encrypted = keyring.encrypt(password)
            const decrypted = caver.wallet.keyring.decrypt(encrypted, password)

            validateKeyring(decrypted, { expectedAddress: keyring.address, expectedKey: keyring.keys })
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

            validateKeyring(decrypted, { expectedAddress: expectedAccount.address, expectedKey: expectedAccount.keys })
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

            validateKeyring(result, { expectedKey: expectedAccount.key, expectedAddress: expectedAccount.address })
            expect(keystoreJsonV3.crypto).not.to.be.undefined
        })
    })
})

describe('keyring.getPublicKey', () => {
    context('CAVERJS-UNIT-KEYRING-053: keyring type: coupled', () => {
        it('return single public key with roled form', () => {
            const keyring = caver.wallet.keyring.generate()
            const pubKey = keyring.getPublicKey()

            expect(pubKey).to.equal(keyring.key.getPublicKey())
        })
    })

    context('CAVERJS-UNIT-KEYRING-054: keyring type: decoupled', () => {
        it('return single public key with roled form', () => {
            const keyring = generateDecoupledKeyring()
            const pubKey = keyring.getPublicKey()

            expect(pubKey).to.equal(keyring.key.getPublicKey())
        })
    })

    context('CAVERJS-UNIT-KEYRING-055: keyring type: multiple keys', () => {
        it('return multiple public keys with roled form', () => {
            const keyring = generateMultiSigKeyring(2)
            const pubKey = keyring.getPublicKey()

            expect(pubKey[0]).to.equal(keyring.keys[0].getPublicKey())
            expect(pubKey[1]).to.equal(keyring.keys[1].getPublicKey())
        })
    })

    context('CAVERJS-UNIT-KEYRING-056: keyring type: role based keys', () => {
        it('return role based public keys with roled form', () => {
            const keyring = generateRoleBasedKeyring([2, 3, 1])
            const pubKey = keyring.getPublicKey()

            expect(pubKey[0][0]).to.equal(keyring.keys[0][0].getPublicKey())
            expect(pubKey[0][1]).to.equal(keyring.keys[0][1].getPublicKey())
            expect(pubKey[1][0]).to.equal(keyring.keys[1][0].getPublicKey())
            expect(pubKey[1][1]).to.equal(keyring.keys[1][1].getPublicKey())
            expect(pubKey[1][2]).to.equal(keyring.keys[1][2].getPublicKey())
            expect(pubKey[2][0]).to.equal(keyring.keys[2][0].getPublicKey())
            expect(pubKey[0].length).to.equal(2)
            expect(pubKey[1].length).to.equal(3)
            expect(pubKey[2].length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRING-166: keyring type: coupled, compressed: true', () => {
        it('return single public key with roled form', () => {
            const keyring = caver.wallet.keyring.generate()
            const pubKey = keyring.getPublicKey(true)

            expect(pubKey).to.equal(keyring.key.getPublicKey(true))
        })
    })

    context('CAVERJS-UNIT-KEYRING-167: keyring type: decoupled, compressed: true', () => {
        it('return single public key with roled form', () => {
            const keyring = generateDecoupledKeyring()
            const pubKey = keyring.getPublicKey(true)

            expect(pubKey).to.equal(keyring.key.getPublicKey(true))
        })
    })

    context('CAVERJS-UNIT-KEYRING-168: keyring type: multiple keys, compressed: true', () => {
        it('return multiple public keys with roled form', () => {
            const keyring = generateMultiSigKeyring(2)
            const pubKey = keyring.getPublicKey(true)

            expect(pubKey[0]).to.equal(keyring.keys[0].getPublicKey(true))
            expect(pubKey[1]).to.equal(keyring.keys[1].getPublicKey(true))
        })
    })

    context('CAVERJS-UNIT-KEYRING-169: keyring type: role based keys, compressed: true', () => {
        it('return role based public keys with roled form', () => {
            const keyring = generateRoleBasedKeyring([2, 3, 1])
            const pubKey = keyring.getPublicKey(true)

            expect(pubKey[0][0]).to.equal(keyring.keys[0][0].getPublicKey(true))
            expect(pubKey[0][1]).to.equal(keyring.keys[0][1].getPublicKey(true))
            expect(pubKey[1][0]).to.equal(keyring.keys[1][0].getPublicKey(true))
            expect(pubKey[1][1]).to.equal(keyring.keys[1][1].getPublicKey(true))
            expect(pubKey[1][2]).to.equal(keyring.keys[1][2].getPublicKey(true))
            expect(pubKey[2][0]).to.equal(keyring.keys[2][0].getPublicKey(true))
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

            validateKeyring(copied, { expectedAddress: keyring.address, expectedKey: keyring.keys })
        })
    })

    context('CAVERJS-UNIT-KEYRING-060: keyring type: role based keys', () => {
        it('return copied keyring which uses different keys by roles', () => {
            const keyring = generateRoleBasedKeyring([2, 3, 1])
            const copied = keyring.copy()

            validateKeyring(copied, { expectedAddress: keyring.address, expectedKey: keyring.keys })
        })
    })
})

describe('keyring.sign', () => {
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
            const signSpy = sinon.spy(coupled.key, 'sign')
            const signed = coupled.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-062: keyring type: coupled / role: existed role / index: 0', () => {
        it('return one signature array', () => {
            const signSpy = sinon.spy(coupled.key, 'sign')
            const signed = coupled.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-063: keyring type: coupled / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(coupled.key, 'sign')
            const signed = coupled.sign(hash, chainId, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-064: keyring type: coupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 1
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(1).`
            expect(() => coupled.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-065: keyring type: decoupled / role: existed role / index: undefined', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key, 'sign')
            const signed = decoupled.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-066: keyring type: decoupled / role: existed role / index: 0', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key, 'sign')
            const signed = decoupled.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-067: keyring type: decoupled / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(decoupled.key, 'sign')
            const signed = decoupled.sign(hash, chainId, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-068: keyring type: decoupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 2
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(1).`
            expect(() => decoupled.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-069: keyring type: multiSig / role: existed role / index: undefined', () => {
        it('return return multiple signatures array', () => {
            const signSpy = sinon.spy(multiSig.keys[0], 'sign')
            const signed = multiSig.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
            expect(signed.length).to.equal(multiSig.keys.length)
        })
    })

    context('CAVERJS-UNIT-KEYRING-070: keyring type: multiSig / role: existed role / index: 2', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(multiSig.keys[2], 'sign')
            const signed = multiSig.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-071: keyring type: multiSig / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(multiSig.keys[0], 'sign')
            const signed = multiSig.sign(hash, chainId, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-072: keyring type: multiSig / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = multiSig.keys.length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${multiSig.keys.length}).`
            expect(() => multiSig.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-073: keyring type: roleBased / role: existed role / index: undefined', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(roleBased.keys[0][0], 'sign')
            const signed = roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
            expect(signed.length).to.equal(roleBased.roleTransactionKey.length)
        })
    })

    context('CAVERJS-UNIT-KEYRING-074: keyring type: roleBased / role: existed role / index: 2', () => {
        it('return return one signature array', () => {
            const signSpy = sinon.spy(roleBased.keys[2][2], 'sign')
            const signed = roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleFeePayerKey, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-075: keyring type: roleBased / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const signSpy = sinon.spy(roleBased.keys[0][0], 'sign')
            const signed = roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-076: keyring type: roleBased / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = roleBased.keys[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${roleBased.keys[0].length}).`
            expect(() => roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-139: keyring type: roleBased / role: existed role / index: invalid type', () => {
        it('should throw error when index is out of range', () => {
            let invalidIndex = []
            let expectedError = `Invalid type of index(${invalidIndex}): index should be number type.`
            expect(() => roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)

            invalidIndex = {}
            expectedError = `Invalid type of index(${invalidIndex}): index should be number type.`
            expect(() => roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-140: keyring type: roleBased / role: existed role / index: negative', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = -1
            const expectedError = `Invalid index(${invalidIndex}): index cannot be negative.`
            expect(() => roleBased.sign(hash, chainId, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })
})

describe('keyring.ecsign', () => {
    let coupled
    let decoupled
    let multiSig
    let roleBased
    const hash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

    function isValidV(sigs) {
        if (!_.isArray(sigs)) sigs = [sigs]
        for (const s of sigs) {
            const vNumber = utils.hexToNumber(s.v)
            if (vNumber !== 0 && vNumber !== 1) {
                return false
            }
        }
        return true
    }

    beforeEach(() => {
        coupled = caver.wallet.keyring.generate()
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([3, 0, 3])
    })

    context('CAVERJS-UNIT-KEYRING-171: keyring type: coupled / role: existed role / index: undefined', () => {
        it('return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(coupled.key, 'ecsign')
            const signed = coupled.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-172: keyring type: coupled / role: existed role / index: 0', () => {
        it('return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(coupled.key, 'ecsign')
            const signed = coupled.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-173: keyring type: coupled / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const ecsignSpy = sinon.spy(coupled.key, 'ecsign')
            const signed = coupled.ecsign(hash, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-174: keyring type: coupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 1
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(1).`
            expect(() => coupled.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-175: keyring type: decoupled / role: existed role / index: undefined', () => {
        it('return return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(decoupled.key, 'ecsign')
            const signed = decoupled.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-176: keyring type: decoupled / role: existed role / index: 0', () => {
        it('return return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(decoupled.key, 'ecsign')
            const signed = decoupled.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-177: keyring type: decoupled / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const ecsignSpy = sinon.spy(decoupled.key, 'ecsign')
            const signed = decoupled.ecsign(hash, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-178: keyring type: decoupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 2
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(1).`
            expect(() => decoupled.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-179: keyring type: multiSig / role: existed role / index: undefined', () => {
        it('return return multiple signatures array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(multiSig.keys[0], 'ecsign')
            const signed = multiSig.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
            expect(signed.length).to.equal(multiSig.keys.length)
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-180: keyring type: multiSig / role: existed role / index: 2', () => {
        it('return return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(multiSig.keys[2], 'ecsign')
            const signed = multiSig.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, 2)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-181: keyring type: multiSig / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const ecsignSpy = sinon.spy(multiSig.keys[0], 'ecsign')
            const signed = multiSig.ecsign(hash, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-182: keyring type: multiSig / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = multiSig.keys.length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${multiSig.keys.length}).`
            expect(() => multiSig.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-183: keyring type: roleBased / role: existed role / index: undefined', () => {
        it('return return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(roleBased.keys[0][0], 'ecsign')
            const signed = roleBased.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(_.isArray(signed)).to.be.true
            expect(signed[0] instanceof SignatureData).to.be.true
            expect(signed.length).to.equal(roleBased.roleTransactionKey.length)
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-184: keyring type: roleBased / role: existed role / index: 2', () => {
        it('return return one signature array with 0 or 1 v of the signature', () => {
            const ecsignSpy = sinon.spy(roleBased.keys[2][2], 'ecsign')
            const signed = roleBased.ecsign(hash, caver.wallet.keyring.role.roleFeePayerKey, 2)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-185: keyring type: roleBased / role: not existed role / index: 0', () => {
        it('return sign with default role key and return one signature array', () => {
            const ecsignSpy = sinon.spy(roleBased.keys[0][0], 'ecsign')
            const signed = roleBased.ecsign(hash, caver.wallet.keyring.role.roleAccountUpdateKey, 0)

            expect(ecsignSpy).to.have.been.calledOnce
            expect(signed instanceof SignatureData).to.be.true
            expect(isValidV(signed)).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-186: keyring type: roleBased / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = roleBased.keys[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${roleBased.keys[0].length}).`
            expect(() => roleBased.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-187: keyring type: roleBased / role: existed role / index: invalid type', () => {
        it('should throw error when index is out of range', () => {
            let invalidIndex = []
            let expectedError = `Invalid type of index(${invalidIndex}): index should be number type.`
            expect(() => roleBased.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)

            invalidIndex = {}
            expectedError = `Invalid type of index(${invalidIndex}): index should be number type.`
            expect(() => roleBased.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-188: keyring type: roleBased / role: existed role / index: negative', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = -1
            const expectedError = `Invalid index(${invalidIndex}): index cannot be negative.`
            expect(() => roleBased.ecsign(hash, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
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
            const expectedError = `role should be defined for signMessage. Please use 'caver.wallet.keyring.role'.`
            expect(() => coupled.signMessage(data)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-086: keyring type: coupled / role: existed role / index: 0', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(coupled.key, 'signMessage')
            const signed = coupled.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-162: keyring type: coupled / role: existed role / index: undefined', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(coupled.key, 'signMessage')
            const signed = coupled.signMessage(data, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-087: keyring type: coupled / role: not existed role / index: 0', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(coupled.key, 'signMessage')
            const signed = coupled.signMessage(data, caver.wallet.keyring.role.roleFeePayerKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-088: keyring type: coupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 1
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(1).`
            expect(() => coupled.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-089: keyring type: decoupled / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const expectedError = `role should be defined for signMessage. Please use 'caver.wallet.keyring.role'.`
            expect(() => decoupled.signMessage(data)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-090: keyring type: decoupled / role: existed role / index: 0', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(decoupled.key, 'signMessage')
            const signed = decoupled.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-163: keyring type: decoupled / role: existed role / index: undefined', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(decoupled.key, 'signMessage')
            const signed = decoupled.signMessage(data, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-091: keyring type: decoupled / role: not existed role / index: 0', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(decoupled.key, 'signMessage')
            const signed = decoupled.signMessage(data, caver.wallet.keyring.role.roleFeePayerKey, 0)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-092: keyring type: decoupled / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = 1
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(1).`
            expect(() => decoupled.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-093: keyring type: multiSig / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const expectedError = `role should be defined for signMessage. Please use 'caver.wallet.keyring.role'.`
            expect(() => multiSig.signMessage(data)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-094: keyring type: multiSig / role: existed role / index: 1', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(multiSig.keys[1], 'signMessage')
            const signed = multiSig.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, 1)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-164: keyring type: multiSig / role: existed role / index: undefined', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(multiSig.keys[1], 'signMessage')
            const signed = multiSig.signMessage(data, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(multiSig.keys.length)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-095: keyring type: multiSig / role: not existed role / index: 2', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(multiSig.keys[2], 'signMessage')
            const signed = multiSig.signMessage(data, caver.wallet.keyring.role.roleFeePayerKey, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-096: keyring type: multiSig / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = multiSig.keys.length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${multiSig.keys.length}).`
            expect(() => multiSig.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-097: keyring type: roleBased / role: undefined / index: undefined', () => {
        it('return sign message with 0th key of default role key', () => {
            const expectedError = `role should be defined for signMessage. Please use 'caver.wallet.keyring.role'.`
            expect(() => roleBased.signMessage(data)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-098: keyring type: roleBased / role: existed role / index: 1', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(roleBased.keys[0][1], 'signMessage')
            const signed = roleBased.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, 1)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-165: keyring type: roleBased / role: existed role / index: undefined', () => {
        it('return sign message with key', () => {
            const signSpy = sinon.spy(roleBased.keys[0][1], 'signMessage')
            const signed = roleBased.signMessage(data, caver.wallet.keyring.role.roleTransactionKey)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(roleBased.roleTransactionKey.length)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-099: keyring type: roleBased / role: not existed role / index: 2', () => {
        it('return sign message with default role key', () => {
            const signSpy = sinon.spy(roleBased.keys[0][2], 'signMessage')
            const signed = roleBased.signMessage(data, caver.wallet.keyring.role.roleAccountUpdateKey, 2)

            expect(signSpy).to.have.been.calledOnce
            expect(signed.message).to.equal(data)
            expect(caver.utils.hashMessage(data)).to.equal(signed.messageHash)
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-100: keyring type: roleBased / role: existed role / index: out of range', () => {
        it('should throw error when index is out of range', () => {
            const invalidIndex = roleBased.keys[0].length
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${roleBased.keys[0].length}).`
            expect(() => roleBased.signMessage(data, caver.wallet.keyring.role.roleTransactionKey, invalidIndex)).to.throw(expectedError)
        })
    })
})

describe('keyring.getKeyByRole', () => {
    let decoupled
    let multiSig
    let roleBased
    let withoutDefaultKey

    beforeEach(() => {
        decoupled = generateDecoupledKeyring()
        multiSig = generateMultiSigKeyring(3)
        roleBased = generateRoleBasedKeyring([3, 4, 5])
        withoutDefaultKey = generateRoleBasedKeyring([0, 0, 5])
    })

    context('CAVERJS-UNIT-KEYRING-160: role: existed role', () => {
        it('return roled key', () => {
            const roledKey = decoupled.getKeyByRole(caver.wallet.keyring.role.roleTransactionKey)

            expect(roledKey).not.to.be.undefined
            expect(roledKey instanceof PrivateKey).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-161: role: not existed role', () => {
        it('return roled key', () => {
            const roledKey = decoupled.getKeyByRole(caver.wallet.keyring.role.roleFeePayerKey)

            expect(roledKey).not.to.be.undefined
            expect(roledKey instanceof PrivateKey).to.be.true
        })
    })

    context('CAVERJS-UNIT-KEYRING-104: role: existed role', () => {
        it('return roled key', () => {
            const roledKey = roleBased.getKeyByRole(caver.wallet.keyring.role.roleTransactionKey)

            expect(roledKey).not.to.be.undefined
            expect(roledKey.length).to.equal(3)
        })
    })

    context('CAVERJS-UNIT-KEYRING-105: role: not existed role', () => {
        it('return default roled key', () => {
            const roledKey = multiSig.getKeyByRole(caver.wallet.keyring.role.roleFeePayerKey)

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
                caver.wallet.keyring.role[caver.wallet.keyring.role.roleAccountUpdateKey]
            } role does not exist. The ${caver.wallet.keyring.role[0]} for the default role is also empty.`

            expect(() => withoutDefaultKey.getKeyByRole(caver.wallet.keyring.role.roleAccountUpdateKey)).to.throw(expectedError)
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

            expect(klaytnWalletKey).to.equal(`${coupled.key.privateKey}0x00${coupled.address}`)
        })
    })

    context('CAVERJS-UNIT-KEYRING-109: keyring type: decoupled', () => {
        it('return valid KlaytnWalletKey', () => {
            const klaytnWalletKey = decoupled.getKlaytnWalletKey()

            expect(klaytnWalletKey).to.equal(`${decoupled.key.privateKey}0x00${decoupled.address}`)
        })
    })

    context('CAVERJS-UNIT-KEYRING-110: keyring type: multiSig', () => {
        it('should throw error when keyring has multiple keys', () => {
            const expectedError = `Not supported for this class.`

            expect(() => multiSig.getKlaytnWalletKey()).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-111: keyring type: roleBased', () => {
        it('should throw error when keyring has multiple keys', () => {
            const expectedError = `Not supported for this class.`

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

    // context('CAVERJS-UNIT-KEYRING-114: keyring type: coupled / options: empty object defined', () => {
    //     it('should throw error if options is defined with single key', () => {
    //         const expectedError = `options cannot be defined with single key.`

    //         expect(() => coupled.toAccount({})).to.throw(expectedError)
    //     })
    // })

    // context('CAVERJS-UNIT-KEYRING-115: keyring type: coupled / options: valid object defined', () => {
    //     it('return account instance which has AccountKeyWeightedMultiSig', () => {
    //         const options = new caver.account.weightedMultiSigOptions(3, [3])

    //         const account = coupled.toAccount(options)

    //         validateAccount(account, { keyring: coupled, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options })
    //     })
    // })

    context('CAVERJS-UNIT-KEYRING-116: keyring type: decoupled / options: undefined', () => {
        it('return account instance which has AccountKeyPublic', () => {
            const account = decoupled.toAccount()

            validateAccount(account, { keyring: decoupled, expectedAccountKey: 'AccountKeyPublic' })
        })
    })

    // context('CAVERJS-UNIT-KEYRING-117: keyring type: decoupled / options: empty object defined', () => {
    //     it('should throw error if options is defined with single key', () => {
    //         const expectedError = `options cannot be defined with single key.`

    //         expect(() => decoupled.toAccount({})).to.throw(expectedError)
    //     })
    // })

    // context('CAVERJS-UNIT-KEYRING-118: keyring type: decoupled / options: valid object defined', () => {
    //     it('return account instance which has AccountKeyWeightedMultiSig', () => {
    //         const options = new caver.account.weightedMultiSigOptions(3, [3])

    //         const account = decoupled.toAccount(options)

    //         validateAccount(account, { keyring: decoupled, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options })
    //     })
    // })

    context('CAVERJS-UNIT-KEYRING-119: keyring type: multiSig / options: undefined', () => {
        it('return account instance which has AccountKeyWeightedMultiSig with default options', () => {
            const account = multiSig.toAccount()
            const exepectedOptions = new caver.account.weightedMultiSigOptions(1, [1, 1, 1])
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-120: keyring type: multiSig / options: defined', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = new caver.account.weightedMultiSigOptions(5, [2, 3, 4])
            const account = multiSig.toAccount(options)
            validateAccount(account, { keyring: multiSig, expectedAccountKey: 'AccountKeyWeightedMultiSig', exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-KEYRING-121: keyring type: multiSig / options: defined(empty array format)', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = []

            const expectedError = `For AccountKeyWeightedMultiSig, options cannot be defined as an array of WeightedMultiSigOptions.`
            expect(() => multiSig.toAccount(options)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-122: keyring type: multiSig / options: defined(array of empty object format)', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = [{}, {}, {}]
            const expectedError = `For AccountKeyWeightedMultiSig, options cannot be defined as an array of WeightedMultiSigOptions.`
            expect(() => multiSig.toAccount(options)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-123: keyring type: multiSig / options: defined(array format)', () => {
        it('return account instance which has AccountKeyWeightedMultiSig', () => {
            const options = [
                new caver.account.weightedMultiSigOptions(5, [2, 3, 4]),
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(),
            ]
            const expectedError = `For AccountKeyWeightedMultiSig, options cannot be defined as an array of WeightedMultiSigOptions.`
            expect(() => multiSig.toAccount(options)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-124: keyring type: roleBased / options: undefined', () => {
        it('return account instance which has AccountKeyRoleBased with default options', () => {
            const account = roleBased.toAccount()
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1, 1, 1]),
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-125: keyring type: roleBased / options: defined', () => {
        it('return account instance which has AccountKeyRoleBased', () => {
            const options = [
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(2, [1, 2]),
                new caver.account.weightedMultiSigOptions(5, [1, 2, 3, 4]),
            ]
            const account = roleBased.toAccount(options)
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-KEYRING-126: keyring type: roleBased / options: empty array', () => {
        it('return account instance which has AccountKeyRoleBased with default options', () => {
            const account = roleBased.toAccount([])
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1, 1, 1]),
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-127: keyring type: roleBased / options: array of empty object', () => {
        it('return account instance which has AccountKeyRoleBased with default options', () => {
            const account = roleBased.toAccount([{}, {}, {}])
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1, 1, 1]),
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-170: keyring type: roleBased / options: array of the object', () => {
        it('return account instance which has AccountKeyRoleBased with weightedMultiSigOptions instances', () => {
            const account = roleBased.toAccount([
                { threshold: 3, weights: [2, 2] },
                { threshold: 4, weights: [2, 2] },
                { threshold: 5, weights: [1, 2, 3, 3] },
            ])
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(3, [2, 2]),
                new caver.account.weightedMultiSigOptions(4, [2, 2]),
                new caver.account.weightedMultiSigOptions(5, [1, 2, 3, 3]),
            ]
            validateAccount(account, { keyring: roleBased, expectedAccountKey: 'AccountKeyRoleBased', exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-KEYRING-128: keyring type: roleBased / options: defined(not array format)', () => {
        it('should throw error when options is insufficient', () => {
            const options = new caver.account.weightedMultiSigOptions(5, [2, 3, 4])
            const expectedError = `options for an account should define threshold and weight for each roles in an array format`

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
            const expectedError = `Not supported for this class. Use 'keyring.encrypt(password)'.`
            expect(() => multiSig.encryptV3(password)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRING-136: keyring type: roleBased, input: password', () => {
        it('should throw error when keyring use different private keys by roles', () => {
            const password = 'password'
            const expectedError = `Not supported for this class. Use 'keyring.encrypt(password)'.`
            expect(() => roleBased.encryptV3(password)).to.throw(expectedError)
        })
    })
})

describe('keyring.isDecoupled', () => {
    context('keyring type: coupled', () => {
        it('CAVERJS-UNIT-KEYRING-141: should return boolean whether decoupled or not', () => {
            const keyring = caver.wallet.keyring.generate()
            expect(keyring.isDecoupled()).to.be.false
        })
    })

    context('keyring type: decoupled', () => {
        it('CAVERJS-UNIT-KEYRING-142: should return boolean whether decoupled or not', () => {
            const keyring = generateDecoupledKeyring()
            expect(keyring.isDecoupled()).to.be.true
        })
    })

    context('keyring type: decoupled', () => {
        it('CAVERJS-UNIT-KEYRING-143: should return boolean whether decoupled or not', () => {
            const keyring = generateMultiSigKeyring(3)
            expect(keyring.isDecoupled()).to.be.true
        })
    })

    context('keyring type: decoupled', () => {
        it('CAVERJS-UNIT-KEYRING-144: should return boolean whether decoupled or not', () => {
            const keyring = generateRoleBasedKeyring([2, 2, 4])
            expect(keyring.isDecoupled()).to.be.true
        })
    })
})
