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
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const testRPCURL = require('../testrpc')

const Caver = require('../../index')
const SingleKeyring = require('../../packages/caver-wallet/src/keyring/singleKeyring')
const MultipleKeyring = require('../../packages/caver-wallet/src/keyring/multipleKeyring')
const RoleBasedKeyring = require('../../packages/caver-wallet/src/keyring/roleBasedKeyring')
const PrivateKey = require('../../packages/caver-wallet/src/keyring/privateKey')

const ValueTransfer = require('../../packages/caver-transaction/src/transactionTypes/valueTransfer/valueTransfer')
const FeeDelegatedValueTransfer = require('../../packages/caver-transaction/src/transactionTypes/valueTransfer/feeDelegatedValueTransfer')
const AccountUpdate = require('../../packages/caver-transaction/src/transactionTypes/accountUpdate/accountUpdate')

const SignatureData = require('../../packages/caver-wallet/src/keyring/signatureData')

const { generateDecoupledKeyring, generateMultiSigKeyring, generateRoleBasedKeyring } = require('./utils')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

function validateKeyringInWallet(data, { expectedAddress, expectedKey } = {}) {
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

describe('wallet.generate', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-001: input: valid number of keyring to make', () => {
        it('should generate keyring instances and add to in-memory wallet', () => {
            const addSpy = sinon.spy(caver.wallet, 'add')

            const addresses = caver.wallet.generate(10)

            for (const address of addresses) {
                expect(caver.utils.isAddress(address)).to.be.true
            }

            expect(addresses.length).to.equal(10)
            expect(caver.wallet.length).to.equal(10)
            expect(addSpy).to.have.been.callCount(10)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-002: input: valid number of keyring to make, entropy', () => {
        it('should generate keyring instances and add to in-memory wallet', () => {
            const addSpy = sinon.spy(caver.wallet, 'add')
            const entropy = caver.utils.randomHex(32)

            const addresses = caver.wallet.generate(10, entropy)

            for (const address of addresses) {
                expect(caver.utils.isAddress(address)).to.be.true
            }

            expect(addresses.length).to.equal(10)
            expect(caver.wallet.length).to.equal(10)
            expect(addSpy).to.have.been.callCount(10)
        })
    })
})

describe('wallet.newKeyring', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-003: input: address, single private key string', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const addSpy = sinon.spy(caver.wallet, 'add')
            const keyring = caver.wallet.keyring.generate()
            const added = caver.wallet.newKeyring(keyring.address, keyring.key.privateKey)

            validateKeyringInWallet(added, { expectedAddress: keyring.address, expectedKey: keyring.key })
            expect(addSpy).to.have.been.calledOnce
            expect(caver.wallet.length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-004: input: address, multiple private key strings', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const addSpy = sinon.spy(caver.wallet, 'add')
            const address = caver.wallet.keyring.generate().address
            const multiplePrivateKeys = caver.wallet.keyring.generateMultipleKeys(3)
            const added = caver.wallet.newKeyring(address, multiplePrivateKeys)

            validateKeyringInWallet(added, { expectedAddress: address, expectedKey: multiplePrivateKeys })
            expect(addSpy).to.have.been.calledOnce
            expect(caver.wallet.length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-005: input: address, private keys by roles(without empty role)', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const addSpy = sinon.spy(caver.wallet, 'add')
            const address = caver.wallet.keyring.generate().address
            const roleBasedPrivateKeys = caver.wallet.keyring.generateRoleBasedKeys([3, 1, 2])
            const added = caver.wallet.newKeyring(address, roleBasedPrivateKeys)

            validateKeyringInWallet(added, { expectedAddress: address, expectedKey: roleBasedPrivateKeys })
            expect(addSpy).to.have.been.calledOnce
            expect(caver.wallet.length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-006: input: address, private keys by roles(with empty role)', () => {
        it('should create keyring instances with parameters and add to in-memory wallet', () => {
            const addSpy = sinon.spy(caver.wallet, 'add')
            const address = caver.wallet.keyring.generate().address
            const roleBasedPrivateKeys = caver.wallet.keyring.generateRoleBasedKeys([0, 0, 2])
            const added = caver.wallet.newKeyring(address, roleBasedPrivateKeys)

            validateKeyringInWallet(added, { expectedAddress: address, expectedKey: roleBasedPrivateKeys })
            expect(addSpy).to.have.been.calledOnce
            expect(caver.wallet.length).to.equal(1)
        })
    })
})

describe('wallet.updateKeyring', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-007: input: coupled keyring', () => {
        it('should update key of keyring', () => {
            const coupled = caver.wallet.keyring.generate()
            const decoupled = caver.wallet.keyring.createWithSingleKey(coupled.address, caver.wallet.keyring.generateSingleKey())
            caver.wallet.add(decoupled)

            const updated = caver.wallet.updateKeyring(coupled)
            const keyringFromContainer = caver.wallet.getKeyring(coupled.address)

            validateKeyringInWallet(updated, { expectedAddress: decoupled.address, expectedKey: coupled.key })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: coupled.address, expectedKey: coupled.key })
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-008: input: decoupled keyring', () => {
        it('should update key of keyring', () => {
            const coupled = caver.wallet.keyring.generate()
            const decoupled = caver.wallet.keyring.createWithSingleKey(coupled.address, caver.wallet.keyring.generateSingleKey())
            caver.wallet.add(coupled)

            const updated = caver.wallet.updateKeyring(decoupled)
            const keyringFromContainer = caver.wallet.getKeyring(coupled.address)

            validateKeyringInWallet(updated, { expectedAddress: coupled.address, expectedKey: decoupled.key })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: coupled.address, expectedKey: decoupled.key })
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-009: input: multiSig keyring', () => {
        it('should update key of keyring', () => {
            const coupled = caver.wallet.keyring.generate()
            const multiSig = generateMultiSigKeyring()
            multiSig.address = coupled.address
            caver.wallet.add(coupled)

            const updated = caver.wallet.updateKeyring(multiSig)
            const keyringFromContainer = caver.wallet.getKeyring(coupled.address)

            validateKeyringInWallet(updated, { expectedAddress: coupled.address, expectedKey: multiSig.keys })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: coupled.address, expectedKey: multiSig.keys })
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-010: input: roleBased keyring', () => {
        it('should update key of keyring', () => {
            const coupled = caver.wallet.keyring.generate()
            const copySpy = sinon.spy(coupled, 'copy')
            const roleBased = generateRoleBasedKeyring()
            roleBased.address = coupled.address
            caver.wallet.add(coupled)

            const updated = caver.wallet.updateKeyring(roleBased)
            const keyringFromContainer = caver.wallet.getKeyring(coupled.address)

            validateKeyringInWallet(updated, { expectedAddress: coupled.address, expectedKey: roleBased.keys })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: coupled.address, expectedKey: roleBased.keys })
            expect(copySpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-011: input: keyring not existed in wallet', () => {
        it('should throw error when fail to find keyring', () => {
            const expectedError = `Failed to find keyring to update`
            expect(() => caver.wallet.updateKeyring(caver.wallet.keyring.generate())).to.throw(expectedError)
        })
    })
})

describe('wallet.getKeyring', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-012: input: valid address', () => {
        it('return keyring from wallet', () => {
            const added = caver.wallet.add(caver.wallet.keyring.generate())

            const keyring = caver.wallet.getKeyring(added.address)

            validateKeyringInWallet(keyring, { expectedAddress: added.address, expectedKey: added.key })
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-013: input: not exist address', () => {
        it('return undefined when fail to find keyring in wallet', () => {
            const generated = caver.wallet.keyring.generate()

            const keyring = caver.wallet.getKeyring(generated.address)

            expect(keyring).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-014: input: invalid address', () => {
        it('should throw error when parameter is invalid', () => {
            const invalidAddress = 'invalid address'
            const expectedError = `Invalid address ${invalidAddress}. To get keyring from wallet, you need to pass a valid address string as a parameter.`
            expect(() => caver.wallet.getKeyring(invalidAddress)).to.throw(expectedError)
        })
    })
})

describe('wallet.add', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-015: input: coupled keyring', () => {
        it('return added keyring which use single private key', () => {
            const keyringToAdd = caver.wallet.keyring.generate()

            const added = caver.wallet.add(keyringToAdd)
            const keyringFromContainer = caver.wallet.getKeyring(added.address)

            validateKeyringInWallet(added, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.key })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.key })

            expect(caver.wallet.length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-016: input: decoupled keyring', () => {
        it('return added keyring which use decoupled private key', () => {
            const keyringToAdd = generateDecoupledKeyring()

            const added = caver.wallet.add(keyringToAdd)
            const keyringFromContainer = caver.wallet.getKeyring(added.address)

            validateKeyringInWallet(added, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.key })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.key })

            expect(caver.wallet.length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-017: input: multiSig keyring', () => {
        it('return added keyring which use multiple private keys', () => {
            const keyringToAdd = generateMultiSigKeyring()

            const added = caver.wallet.add(keyringToAdd)
            const keyringFromContainer = caver.wallet.getKeyring(added.address)

            validateKeyringInWallet(added, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.keys })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.keys })

            expect(caver.wallet.length).to.equal(1)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-018: input: roleBased keyring', () => {
        it('return added keyring which use different private keys by roles', () => {
            const keyringToAdd = generateRoleBasedKeyring()

            const added = caver.wallet.add(keyringToAdd)
            const keyringFromContainer = caver.wallet.getKeyring(added.address)

            validateKeyringInWallet(added, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.keys })
            validateKeyringInWallet(keyringFromContainer, { expectedAddress: keyringToAdd.address, expectedKey: keyringToAdd.keys })

            expect(caver.wallet.length).to.equal(1)
        })
    })
})

describe('wallet.remove', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-019: input: coupled keyring', () => {
        it('should remove keyring from keyringContainer and return remove result with boolean value', () => {
            const keyringToAdd = caver.wallet.keyring.generate()

            const added = caver.wallet.add(keyringToAdd)
            const result = caver.wallet.remove(added.address)

            expect(result).to.be.true
            expect(caver.wallet.length).to.equal(0)
            expect(caver.wallet.getKeyring(added.address)).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-020: input: decoupled keyring', () => {
        it('should remove keyring from keyringContainer and return remove result with boolean value', () => {
            const keyringToAdd = generateDecoupledKeyring()

            const added = caver.wallet.add(keyringToAdd)
            const result = caver.wallet.remove(added.address)

            expect(result).to.be.true
            expect(caver.wallet.length).to.equal(0)
            expect(caver.wallet.getKeyring(added.address)).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-021: input: multiSig keyring', () => {
        it('should remove keyring from keyringContainer and return remove result with boolean value', () => {
            const keyringToAdd = generateMultiSigKeyring()

            const added = caver.wallet.add(keyringToAdd)
            const result = caver.wallet.remove(added.address)

            expect(result).to.be.true
            expect(caver.wallet.length).to.equal(0)
            expect(caver.wallet.getKeyring(added.address)).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-022: input: roleBased keyring', () => {
        it('should remove keyring from keyringContainer and return remove result with boolean value', () => {
            const keyringToAdd = generateRoleBasedKeyring()

            const added = caver.wallet.add(keyringToAdd)
            const result = caver.wallet.remove(added.address)

            expect(result).to.be.true
            expect(caver.wallet.length).to.equal(0)
            expect(caver.wallet.getKeyring(added.address)).to.be.undefined
        })
    })
})

describe('wallet.sign', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-023: input: address, value transfer transaction', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendSignatures')

            await caver.wallet.sign(keyring.address, vt)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledOnce
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-024: input: address, value transfer transaction, valid index', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendSignatures')

            await caver.wallet.sign(keyring.address, vt, 2)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledOnce
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-025: input: address, value transfer transaction, custom hasher', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const txHash = '0xd4aab6590bdb708d1d3eafe95a967dafcd2d7cde197e512f3f0b8158e7b65fd1'

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendSignatures')

            await caver.wallet.sign(keyring.address, vt, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-026: input: address, value transfer transaction, index, custom hasher', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const txHash = '0xd4aab6590bdb708d1d3eafe95a967dafcd2d7cde197e512f3f0b8158e7b65fd1'

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendSignatures')

            await caver.wallet.sign(keyring.address, vt, 1, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-027: input: address, account update transaction, index, custom hasher', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const updateTx = generateAccountUpdate(keyring)

            const txHash = '0xd4aab6590bdb708d1d3eafe95a967dafcd2d7cde197e512f3f0b8158e7b65fd1'

            const fillFormatSpy = sinon.spy(updateTx, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(updateTx, 'appendSignatures')

            await caver.wallet.sign(keyring.address, updateTx, 1, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 1, 1)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-028: input: address, value transfer transaction, invalid index', () => {
        it('should throw error when index is invalid', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const invalidIndex = 3
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${invalidIndex}).`
            await expect(caver.wallet.sign(keyring.address, vt, invalidIndex)).to.be.rejectedWith(expectedError)
        })
    })

    context(
        'CAVERJS-UNIT-KEYRINGCONTAINER-029: input: address, value transfer transaction, valid index, invalid hasher custom funtion',
        () => {
            it('should throw error when transaction hash is invalid', async () => {
                const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

                const vt = generateValueTransfer(keyring)

                const invalidTxHash = 'invalidTxHash'

                const expectedError = `Invalid transaction hash: ${invalidTxHash}`
                await expect(caver.wallet.sign(keyring.address, vt, 0, () => invalidTxHash)).to.be.rejectedWith(expectedError)
            })
        }
    )

    context('CAVERJS-UNIT-KEYRINGCONTAINER-030: input: not exist keyring address, value transfer transaction', () => {
        it('should throw error when keyring is not existed in wallet', async () => {
            const keyring = generateRoleBasedKeyring([3, 2, 4])

            const vt = generateValueTransfer(keyring)

            const expectedError = `Failed to find keyring from wallet with ${keyring.address}`
            await expect(caver.wallet.sign(keyring.address, vt)).to.be.rejectedWith(expectedError)
        })
    })
})

describe('wallet.sign', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-031: input: address, value transfer transaction', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendSignatures')

            await caver.wallet.sign(keyring.address, vt)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledOnce
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-032: input: address, value transfer transaction, custom hasher', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendSignatures')

            await caver.wallet.sign(keyring.address, vt, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-033: input: address, account update transaction, custom hasher', () => {
        it('should sign to transaction and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const updateTx = generateAccountUpdate(keyring)

            const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

            const fillFormatSpy = sinon.spy(updateTx, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(updateTx, 'appendSignatures')

            await caver.wallet.sign(keyring.address, updateTx, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-034: input: address, value transfer transaction, invalid hasher custom funtion', () => {
        it('should throw error when transaction hash is invalid', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateValueTransfer(keyring)

            const invalidTxHash = 'invalidTxHash'

            const expectedError = `Invalid transaction hash: ${invalidTxHash}`
            await expect(caver.wallet.sign(keyring.address, vt, () => invalidTxHash)).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-035: input: not exist keyring address, value transfer transaction', () => {
        it('should throw error when keyring is not existed in wallet', async () => {
            const keyring = generateRoleBasedKeyring([3, 2, 4])

            const vt = generateValueTransfer(keyring)

            const expectedError = `Failed to find keyring from wallet with ${keyring.address}`
            await expect(caver.wallet.sign(keyring.address, vt)).to.be.rejectedWith(expectedError)
        })
    })
})

describe('wallet.signMessage', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-036: input: address, data, role', () => {
        it('should sign to message and return signed result', () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const data = 'Some data'

            const getKeyringSpy = sinon.spy(caver.wallet, 'getKeyring')
            const signMessageSpy = sinon.spy(keyring, 'signMessage')

            const signed = caver.wallet.signMessage(keyring.address, data, caver.wallet.keyring.role.roleTransactionKey)

            expect(signed.messageHash).to.equal(caver.utils.hashMessage(data))
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(keyring.roleTransactionKey.length)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
            expect(signed.message).to.equal(data)
            expect(getKeyringSpy).to.have.been.calledOnce
            expect(signMessageSpy).to.have.been.calledWith(data, 0, undefined)
        })
    })
    context('CAVERJS-UNIT-KEYRINGCONTAINER-051: input: address, data, role, index', () => {
        it('should sign to message and return signed result', () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const data = 'Some data'

            const getKeyringSpy = sinon.spy(caver.wallet, 'getKeyring')
            const signMessageSpy = sinon.spy(keyring, 'signMessage')

            const signed = caver.wallet.signMessage(keyring.address, data, caver.wallet.keyring.role.roleTransactionKey, 0)

            expect(signed.messageHash).to.equal(caver.utils.hashMessage(data))
            expect(_.isArray(signed.signatures)).to.be.true
            expect(signed.signatures.length).to.equal(1)
            expect(signed.signatures[0] instanceof SignatureData).to.be.true
            expect(signed.message).to.equal(data)
            expect(getKeyringSpy).to.have.been.calledOnce
            expect(signMessageSpy).to.have.been.calledWith(data, 0, 0)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-037: input: not exist keyring address, data', () => {
        it('should throw error when keyring is not existed in wallet', () => {
            const keyring = generateRoleBasedKeyring([3, 2, 4])

            const data = 'Some data'

            const expectedError = `Failed to find keyring from wallet with ${keyring.address}`

            expect(() => caver.wallet.signMessage(keyring.address, data)).to.throw(expectedError)
        })
    })
})

describe('wallet.signAsFeePayer', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-038: input: address, value transfer transaction', () => {
        it('should sign to transaction with roleFeePayerKey and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendFeePayerSignatures')

            await caver.wallet.signAsFeePayer(keyring.address, vt)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledOnce
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-039: input: address, value transfer transaction, valid index', () => {
        it('should sign to transaction with roleFeePayerKey and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendFeePayerSignatures')

            await caver.wallet.signAsFeePayer(keyring.address, vt, 2)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledOnce
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-040: input: address, value transfer transaction, custom hasher', () => {
        it('should sign to transaction with roleFeePayerKey and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendFeePayerSignatures')

            await caver.wallet.signAsFeePayer(keyring.address, vt, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-041: input: address, value transfer transaction, index, custom hasher', () => {
        it('should sign to transaction with roleFeePayerKey and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendFeePayerSignatures')

            await caver.wallet.signAsFeePayer(keyring.address, vt, 1, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-042: input: address, value transfer transaction, invalid index', () => {
        it('should throw error when index is invalid', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const invalidIndex = 4
            const expectedError = `Invalid index(${invalidIndex}): index must be less than the length of keys(${invalidIndex}).`
            await expect(caver.wallet.signAsFeePayer(keyring.address, vt, invalidIndex)).to.be.rejectedWith(expectedError)
        })
    })

    context(
        'CAVERJS-UNIT-KEYRINGCONTAINER-043: input: address, value transfer transaction, valid index, invalid hasher custom funtion',
        () => {
            it('should throw error when transaction hash is invalid', async () => {
                const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

                const vt = generateFeeDelegatedValueTransfer(keyring)

                const invalidTxHash = 'invalidTxHash'

                const expectedError = `Invalid transaction hash: ${invalidTxHash}`
                await expect(caver.wallet.signAsFeePayer(keyring.address, vt, 0, () => invalidTxHash)).to.be.rejectedWith(expectedError)
            })
        }
    )

    context('CAVERJS-UNIT-KEYRINGCONTAINER-044: input: not exist keyring address, value transfer transaction', () => {
        it('should throw error when keyring is not existed in wallet', async () => {
            const keyring = generateRoleBasedKeyring([3, 2, 4])

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const expectedError = `Failed to find keyring from wallet with ${keyring.address}`
            await expect(caver.wallet.signAsFeePayer(keyring.address, vt)).to.be.rejectedWith(expectedError)
        })
    })
})

describe('wallet.signAsFeePayer', () => {
    context('CAVERJS-UNIT-KEYRINGCONTAINER-045: input: address, value transfer transaction', () => {
        it('should sign to transaction with keys in roleFeePayerKey and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendFeePayerSignatures')

            await caver.wallet.signAsFeePayer(keyring.address, vt)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledOnce
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-046: input: address, value transfer transaction, custom hasher', () => {
        it('should sign to transaction with keys in roleFeePayerKey and return hash', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

            const fillFormatSpy = sinon.spy(vt, 'fillTransaction')
            const signSpy = sinon.spy(keyring, 'sign')
            const appendSpy = sinon.spy(vt, 'appendFeePayerSignatures')

            await caver.wallet.signAsFeePayer(keyring.address, vt, () => txHash)

            expect(fillFormatSpy).to.have.been.calledOnce
            expect(signSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            expect(appendSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-047: input: address, value transfer transaction, invalid hasher custom funtion', () => {
        it('should throw error when transaction hash is invalid', async () => {
            const keyring = caver.wallet.add(generateRoleBasedKeyring([3, 2, 4]))

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const invalidTxHash = 'invalidTxHash'

            const expectedError = `Invalid transaction hash: ${invalidTxHash}`
            await expect(caver.wallet.signAsFeePayer(keyring.address, vt, () => invalidTxHash)).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-KEYRINGCONTAINER-048: input: not exist keyring address, value transfer transaction', () => {
        it('should throw error when keyring is not existed in wallet', async () => {
            const keyring = generateRoleBasedKeyring([3, 2, 4])

            const vt = generateFeeDelegatedValueTransfer(keyring)

            const expectedError = `Failed to find keyring from wallet with ${keyring.address}`
            await expect(caver.wallet.signAsFeePayer(keyring.address, vt)).to.be.rejectedWith(expectedError)
        })
    })
})

function generateValueTransfer(keyring) {
    return new ValueTransfer({
        from: keyring.address,
        to: keyring.address,
        value: '0x1',
        gas: '0x15f90',
        chainId: '0x7e3',
        nonce: '0x0',
        gasPrice: '0x5d21dba00',
    })
}

function generateFeeDelegatedValueTransfer(keyring) {
    return new FeeDelegatedValueTransfer({
        from: keyring.address,
        to: keyring.address,
        value: '0x1',
        gas: '0x15f90',
        chainId: '0x7e3',
        nonce: '0x0',
        gasPrice: '0x5d21dba00',
    })
}

function generateAccountUpdate(keyring) {
    return new AccountUpdate({
        from: keyring.address,
        account: keyring.toAccount(),
        gas: '0x15f90',
        chainId: '0x7e3',
        nonce: '0x0',
        gasPrice: '0x5d21dba00',
    })
}
