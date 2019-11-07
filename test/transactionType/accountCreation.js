/*
    Copyright 2018 The caver-js Authors
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

require('it-each')({ testPerIteration: true })
const assert = require('assert')
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

let caver
let senderPrvKey
let senderAddress
let testAccount

before(() => {
    caver = new Caver(testRPCURL)
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
})

describe('ACCOUNT_CREATION transaction', () => {
    let accountCreationObject
    const pubKey1 =
        '0x82e50e05ae21d4d35cf41856ec665b70ddb65fa3570f71f50b236f221fbd57598cfac224fee0b41f6152484060a608110757caf4eb7e7fbbd7a097244539e2e7'
    const pubKey2 =
        '0x8e9cc1d6826761c492160378022740368d256a7d697e84875d268711702e084c165f4a4823d4a8256f8141df5f377344d9dfb6e684e3cb7e91b7e928010d6508'
    const pubKey3 =
        '0x6d545db2dcba5a9f4201e4199ac5308b3e4f31033a9be3ebc0944e2d2fb0b7622f903f53e0ea5d0e20ce748a3da08052e6533107acaad0c14aba8c54f40154a3'
    const pubKey4 =
        '0xdff805352a763474506f1d4d288f5e5484335e32b378d8f4436b34affe3af661047fd41074f863b2c4d157891b2574fce6a735743f0442ac5b1d86bd55ed67ae'
    const multisig = {
        threshold: 3,
        keys: [
            { weight: 1, publicKey: pubKey1 },
            { weight: 1, publicKey: pubKey2 },
            { weight: 1, publicKey: pubKey3 },
            { weight: 1, publicKey: pubKey4 },
        ],
    }
    beforeEach(() => {
        testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        accountCreationObject = {
            type: 'ACCOUNT_CREATION',
            from: senderAddress,
            to: testAccount.address,
            value: 1,
            gas: 900000,
        }
    })

    // Error from missing
    it('CAVERJS-UNIT-TX-109 : If transaction object missing from, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.from

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-109 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.from

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error to missing
    it('CAVERJS-UNIT-TX-110 : If transaction object missing to, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.to

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-110 : If transaction object missing to, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.to

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error value missing
    it('CAVERJS-UNIT-TX-111 : If transaction object missing value, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.value

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-111 : If transaction object missing value, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.value

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error gas and gasLimit missing
    it('CAVERJS-UNIT-TX-112 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.gas

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-112 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)
        delete tx.gas

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // MissingKey
    it('CAVERJS-UNIT-TX-113 : If transaction object missing key information, signTransaction should throw error', async () => {
        const tx = Object.assign({}, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('Missing key information with ACCOUNT_CREATION transaction')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-113 : If transaction object missing key information, sendTransaction should throw error', () => {
        const tx = Object.assign({}, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('Missing key information with ACCOUNT_CREATION transaction')
    }).timeout(200000)

    // Creation with publicKey.
    it('CAVERJS-UNIT-TX-114 : If transaction object has publicKey, create account with publicKey', async () => {
        const tx = Object.assign({ publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(async () => {
                await caver.klay
                    .getAccountKey(tx.to)
                    .then(key => {
                        expect(key.keyType).to.equals(2)
                        result = true
                    })
                    .catch(() => (result = false))
            })
            .catch(() => (result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // PublicKeyLength64
    it('CAVERJS-UNIT-TX-116 : If compressed publicKey length is not 64, signTransaction should return error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(32) }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-116 : If compressed publicKey length is not 64, sendTransaction should return error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(32) }, accountCreationObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    // PublicKeyLength126
    it('CAVERJS-UNIT-TX-117 : If uncompressed publicKey length is 126, signTransaction should return error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(63) }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-117 : If uncompressed publicKey length is 126, sendTransaction should return error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(63) }, accountCreationObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    // Creation with multisig.
    it('CAVERJS-UNIT-TX-118 : If transaction object has multisig, create account with multisig', async () => {
        const tx = Object.assign({ multisig }, accountCreationObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(async () => {
                await caver.klay
                    .getAccountKey(tx.to)
                    .then(key => {
                        expect(key.keyType).to.equals(4)
                        result = true
                    })
                    .catch(() => (result = false))
            })
            .catch(() => (result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // Creation with multisig and publicKey.
    it('CAVERJS-UNIT-TX-119 : If transaction object has multisig and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-119 : If transaction object has multisig and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Creation with roleTransactionKey.
    it('CAVERJS-UNIT-TX-120 : If transaction object has roleTransactionKey, create account with roleTransactionKey', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 } }, accountCreationObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(async receipt => {
                await caver.klay
                    .getAccountKey(tx.to)
                    .then(key => {
                        const expectedXY = caver.utils.xyPointFromPublicKey(pubKey1)
                        expect(key.keyType).to.equals(5)
                        expect(key.key.length).to.equals(1)
                        expect(key.key[0].keyType).to.equals(2)
                        expect(key.key[0].key.x).to.equals(expectedXY[0])
                        expect(key.key[0].key.y).to.equals(expectedXY[1])
                        result = true
                    })
                    .catch((result = false))
            })
            .catch((result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // Creation with roleTransactionKey and publicKey.
    it('CAVERJS-UNIT-TX-121 : If transaction object has roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-121 : If transaction object has roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Creation with roleTransactionKey and multisig.
    it('CAVERJS-UNIT-TX-122 : If transaction object has roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-122 : If transaction object has roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Creation with roleTransactionKey and multisig and publicKey.
    it('CAVERJS-UNIT-TX-123 : If transaction object has roleTransactionKey and multisig and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 }, multisig, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-123 : If transaction object has roleTransactionKey and multisig and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey: pubKey1 }, multisig, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey without roleTransactionKey
    it('CAVERJS-UNIT-TX-124 : If transaction object has only roleAccountUpdateKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 } }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-124 : If transaction object has only roleAccountUpdateKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey with roleTransactionKey
    it('CAVERJS-UNIT-TX-125 : If transaction object has roleAccountUpdateKey and roleTransactionKey, create account with roleTransactionKey and roleAccountUpdateKey', async () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 } },
            accountCreationObject
        )

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(async receipt => {
                expect(receipt.to).to.equals(tx.to)
                await caver.klay
                    .getAccountKey(receipt.to)
                    .then(key => {
                        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(pubKey1)
                        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(pubKey2)
                        expect(key.keyType).to.equals(5)
                        expect(key.key.length).to.equals(2)
                        expect(key.key[0].keyType).to.equals(2)
                        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
                        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
                        expect(key.key[1].keyType).to.equals(2)
                        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
                        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
                        result = true
                    })
                    .catch((result = false))
            })
            .catch((result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // RoleAccountUpdateKey with publicKey
    it('CAVERJS-UNIT-TX-126 : If transaction object has roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-126 : If transaction object has roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)
        // Throw error from formatter validation

        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey with multisig
    it('CAVERJS-UNIT-TX-127 : If transaction object has roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-127 : If transaction object has roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey with multisig and publicKey
    it('CAVERJS-UNIT-TX-128 : If transaction object has roleAccountUpdateKey, multisig and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 }, multisig, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-128 : If transaction object has roleAccountUpdateKey, multisig and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey: pubKey1 }, multisig, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey with roleTransactionKey and publicKey
    it('CAVERJS-UNIT-TX-129 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, publicKey: pubKey1 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-129 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, publicKey: pubKey1 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey with roleTransactionKey and multisig
    it('CAVERJS-UNIT-TX-130 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-130 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleAccountUpdateKey with roleTransactionKey, multisig and publicKey
    it('CAVERJS-UNIT-TX-131 : If transaction object has roleAccountUpdateKey, roleTransactionKey, multisig and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, multisig, publicKey: pubKey1 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-131 : If transaction object has roleAccountUpdateKey, roleTransactionKey, multisig and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, multisig, publicKey: pubKey1 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey without roleTransactionKey and roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-132 : If transaction object has only roleFeePayerKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 } }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-132 : If transaction object has only roleFeePayerKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey
    it('CAVERJS-UNIT-TX-133 : If transaction object has roleFeePayerKey and roleTransactionKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 } },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-133 : If transaction object has roleFeePayerKey and roleTransactionKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 } },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-134 : If transaction object has roleFeePayerKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 } },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-134 : If transaction object has roleFeePayerKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 } },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleAccountUpdateKey and roleTransactionKey
    it('CAVERJS-UNIT-TX-135 : If transaction object has roleFeePayerKey, roleTransactionKey and roleAccountUpdateKey, create account with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey', async () => {
        const tx = Object.assign(
            {
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
            },
            accountCreationObject
        )

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(async receipt => {
                expect(receipt.to).to.equals(tx.to)
                await caver.klay
                    .getAccountKey(receipt.to)
                    .then(key => {
                        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(pubKey1)
                        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(pubKey2)
                        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(pubKey3)
                        expect(key.keyType).to.equals(5)
                        expect(key.key.length).to.equals(3)
                        expect(key.key[0].keyType).to.equals(2)
                        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
                        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
                        expect(key.key[1].keyType).to.equals(2)
                        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
                        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
                        expect(key.key[2].keyType).to.equals(2)
                        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
                        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])
                        result = true
                    })
                    .catch((result = false))
            })
            .catch((result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // RoleFeePayerKey with publicKey
    it('CAVERJS-UNIT-TX-136 : If transaction object has roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 }, publicKey: pubKey2 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-136 : If transaction object has roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 }, publicKey: pubKey2 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with multisig
    it('CAVERJS-UNIT-TX-137 : If transaction object has roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-137 : If transaction object has roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with publicKey and multisig
    it('CAVERJS-UNIT-TX-138 : If transaction object has roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 }, multisig, publicKey: pubKey2 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-138 : If transaction object has roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey: pubKey1 }, multisig, publicKey: pubKey2 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey and publicKey
    it('CAVERJS-UNIT-TX-139 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, publicKey: pubKey3 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-139 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, publicKey: pubKey3 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey and multisig
    it('CAVERJS-UNIT-TX-140 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-140 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-141 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, publicKey: pubKey3, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-141 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleTransactionKey: { publicKey: pubKey2 }, publicKey: pubKey3, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleAccountUpdateKey and publicKey
    it('CAVERJS-UNIT-TX-142 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, publicKey: pubKey3 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-142 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, publicKey: pubKey3 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleAccountUpdateKey and multisig
    it('CAVERJS-UNIT-TX-143 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-143 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleAccountUpdateKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-144 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, publicKey: pubKey3, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-144 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleFeePayerKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, publicKey: pubKey3, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey, roleAccountUpdateKey and publicKey
    it('CAVERJS-UNIT-TX-145 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                roleFeePayerKey: { publicKey: pubKey1 },
                roleTransactionKey: { publicKey: pubKey2 },
                roleAccountUpdateKey: { publicKey: pubKey3 },
                publicKey: pubKey4,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-145 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                roleFeePayerKey: { publicKey: pubKey1 },
                roleTransactionKey: { publicKey: pubKey2 },
                roleAccountUpdateKey: { publicKey: pubKey3 },
                publicKey: pubKey4,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey, roleAccountUpdateKey and multisig
    it('CAVERJS-UNIT-TX-146 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                roleFeePayerKey: { publicKey: pubKey1 },
                roleTransactionKey: { publicKey: pubKey2 },
                roleAccountUpdateKey: { publicKey: pubKey3 },
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-146 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                roleFeePayerKey: { publicKey: pubKey1 },
                roleTransactionKey: { publicKey: pubKey2 },
                roleAccountUpdateKey: { publicKey: pubKey3 },
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // RoleFeePayerKey with roleTransactionKey, roleAccountUpdateKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-147 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                roleFeePayerKey: { publicKey: pubKey1 },
                roleTransactionKey: { publicKey: pubKey2 },
                roleAccountUpdateKey: { publicKey: pubKey3 },
                publicKey: pubKey4,
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-147 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                roleFeePayerKey: { publicKey: pubKey1 },
                roleTransactionKey: { publicKey: pubKey2 },
                roleAccountUpdateKey: { publicKey: pubKey3 },
                publicKey: pubKey4,
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Create account with failKey
    it('CAVERJS-UNIT-TX-148 : If transaction object has only failKey, create account with failKey', async () => {
        const tx = Object.assign({ failKey: true }, accountCreationObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(async receipt => {
                expect(receipt.to).to.equals(tx.to)
                await caver.klay
                    .getAccountKey(receipt.to)
                    .then(key => {
                        expect(key.keyType).to.equals(3)
                        result = true
                    })
                    .catch((result = false))
            })
            .catch((result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // FailKey with publicKey
    it('CAVERJS-UNIT-TX-149 : If transaction object has failKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-149 : If transaction object has failKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with multisig
    it('CAVERJS-UNIT-TX-150 : If transaction object has failKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-150 : If transaction object has failKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with publicKey and multisig
    it('CAVERJS-UNIT-TX-151 : If transaction object has failKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, publicKey: pubKey1, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-151 : If transaction object has failKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, publicKey: pubKey1, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey
    it('CAVERJS-UNIT-TX-152 : If transaction object has failKey and roleTransactionKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey: pubKey1 } }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-152 : If transaction object has failKey and roleTransactionKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey and publicKey
    it('CAVERJS-UNIT-TX-153 : If transaction object has failKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-153 : If transaction object has failKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey and multisig
    it('CAVERJS-UNIT-TX-154 : If transaction object has failKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-154 : If transaction object has failKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-155 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, publicKey: pubKey1, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-155 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, publicKey: pubKey1, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-156 : If transaction object has failKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 } }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-156 : If transaction object has failKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleAccountUpdateKey and publicKey
    it('CAVERJS-UNIT-TX-157 : If transaction object has failKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-157 : If transaction object has failKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleAccountUpdateKey and multisig
    it('CAVERJS-UNIT-TX-158 : If transaction object has failKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-158 : If transaction object has failKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleAccountUpdateKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-159 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 }, publicKey: pubKey1, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-159 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey: pubKey1 }, publicKey: pubKey1, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleFeePayerKey
    it('CAVERJS-UNIT-TX-160 : If transaction object has failKey and roleFeePayerKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey: pubKey1 } }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-160 : If transaction object has failKey and roleFeePayerKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleFeePayerKey and publicKey
    it('CAVERJS-UNIT-TX-161 : If transaction object has failKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-161 : If transaction object has failKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey: pubKey1 }, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleFeePayerKey and multisig
    it('CAVERJS-UNIT-TX-162 : If transaction object has failKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-162 : If transaction object has failKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey: pubKey1 }, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleFeePayerKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-163 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleFeePayerKey: { publicKey: pubKey1 }, publicKey: pubKey1, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-163 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleFeePayerKey: { publicKey: pubKey1 }, publicKey: pubKey1, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleAccountUpdateKey and publicKey
    it('CAVERJS-UNIT-TX-164 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, publicKey: pubKey1 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-164 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, publicKey: pubKey1 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleAccountUpdateKey and multisig
    it('CAVERJS-UNIT-TX-165 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-165 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleAccountUpdateKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleAccountUpdateKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-166 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-166 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleFeePayerKey and publicKey
    it('CAVERJS-UNIT-TX-167 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleFeePayerKey: { publicKey: pubKey2 }, publicKey: pubKey1 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-167 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleFeePayerKey: { publicKey: pubKey2 }, publicKey: pubKey1 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleFeePayerKey and multisig
    it('CAVERJS-UNIT-TX-168 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleFeePayerKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-168 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey: pubKey1 }, roleFeePayerKey: { publicKey: pubKey2 }, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleFeePayerKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-169 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleFeePayerKey: { publicKey: pubKey2 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-169 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleFeePayerKey: { publicKey: pubKey2 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with  roleAccountUpdateKey, roleFeePayerKey and publicKey
    it('CAVERJS-UNIT-TX-170 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey: pubKey2 }, roleFeePayerKey: { publicKey: pubKey3 }, publicKey: pubKey1 },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-170 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey: pubKey2 }, roleFeePayerKey: { publicKey: pubKey3 }, publicKey: pubKey1 },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleAccountUpdateKey, roleFeePayerKey and multisig
    it('CAVERJS-UNIT-TX-171 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey: pubKey2 }, roleFeePayerKey: { publicKey: pubKey3 }, multisig },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-171 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey: pubKey2 }, roleFeePayerKey: { publicKey: pubKey3 }, multisig },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-172 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-172 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey
    it('CAVERJS-UNIT-TX-173 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                publicKey: pubKey1,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-173 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                publicKey: pubKey1,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig
    it('CAVERJS-UNIT-TX-174 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-174 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // FailKey with roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig
    it('CAVERJS-UNIT-TX-175 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-175 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey: pubKey1 },
                roleAccountUpdateKey: { publicKey: pubKey2 },
                roleFeePayerKey: { publicKey: pubKey3 },
                publicKey: pubKey1,
                multisig,
            },
            accountCreationObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // UnnecessaryData
    it('CAVERJS-UNIT-TX-176 : If transaction object has data, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1, data: '0x68656c6c6f' }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-176 : If transaction object has data, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1, data: '0x68656c6c6f' }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // UnnecessaryFeePayer
    it('CAVERJS-UNIT-TX-177 : If transaction object has feePayer, signTransaction should throw error', async () => {
        const payer = caver.klay.accounts.create()
        const tx = Object.assign({ publicKey: pubKey1, feePayer: payer.address }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-177 : If transaction object has data, sendTransaction should throw error', () => {
        const payer = caver.klay.accounts.create()
        const tx = Object.assign({ publicKey: pubKey1, feePayer: payer.address }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // UnnecessaryFeeRatio
    it('CAVERJS-UNIT-TX-178 : If transaction object has feeRatio, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1, feeRatio: 20 }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-178 : If transaction object has feeRatio, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1, feeRatio: 20 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // UnnecessaryCodeFormat
    it('CAVERJS-UNIT-TX-179 : If transaction object has codeFormat, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: pubKey1, codeFormat: 'EVM' }, accountCreationObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-179 : If transaction object has codeFormat, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey: pubKey1, codeFormat: 'EVM' }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Create account with legacyKey
    it('CAVERJS-UNIT-TX-180 : If transaction object has only legacyKey, create account with legacyKey', async () => {
        const tx = Object.assign({ legacyKey: true }, accountCreationObject)

        const receipt = await caver.klay.sendTransaction(tx)
        expect(receipt.to).to.equals(tx.to)

        const key = await caver.klay.getAccountKey(receipt.to)
        expect(key.keyType).to.equals(1)
    }).timeout(200000)

    // LegacyKey with publicKey
    it('CAVERJS-UNIT-TX-181 : If transaction object has legacyKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, publicKey: pubKey1 }, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-181 : If transaction object has legacyKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, publicKey: pubKey1 }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
    }).timeout(200000)

    // LegacyKey with multisig
    it('CAVERJS-UNIT-TX-182 : If transaction object has legacyKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, multisig }, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-182 : If transaction object has legacyKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, multisig }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
    }).timeout(200000)

    // LegacyKey with failKey
    it('CAVERJS-UNIT-TX-183 : If transaction object has legacyKey and failKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, failKey: true }, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-183 : If transaction object has legacyKey and failKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, failKey: true }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
    }).timeout(200000)

    // LegacyKey with roleTransactionKey
    it('CAVERJS-UNIT-TX-184 : If transaction object has legacyKey and roleTransactionKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, roleTransactionKey: { publicKey: pubKey1 } }, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-184 : If transaction object has legacyKey and roleTransactionKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, roleTransactionKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
    }).timeout(200000)

    // LegacyKey with roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-185 : If transaction object has legacyKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, roleAccountUpdateKey: { publicKey: pubKey1 } }, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-185 : If transaction object has legacyKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, roleAccountUpdateKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
    }).timeout(200000)

    // LegacyKey with roleFeePayerKey
    it('CAVERJS-UNIT-TX-186 : If transaction object has legacyKey and roleFeePayerKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, roleFeePayerKey: { publicKey: pubKey1 } }, accountCreationObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => {
                expect(err.message).to.equals('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
            })
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-186 : If transaction object has legacyKey and roleFeePayerKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, roleFeePayerKey: { publicKey: pubKey1 } }, accountCreationObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_CREATION is duplicated.')
    }).timeout(200000)
})
