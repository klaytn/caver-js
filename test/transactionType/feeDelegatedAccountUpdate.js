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
let payerPrvKey
let senderAddress
let payerAddress
let testAccount

describe('FEE_DELEGATED_ACCOUNT_UPDATE transaction', () => {
    let accountUpdateObject
    let publicKey
    let publicKey2
    let publicKey3
    let publicKey4
    let privateKey
    let privateKey2
    let privateKey3
    let privateKey4
    let multisig

    const createTestAccount = () => {
        publicKey = caver.klay.accounts.privateKeyToPublicKey(caver.klay.accounts.create().privateKey)
        testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        const txObject = {
            from: senderAddress,
            to: testAccount.address,
            value: caver.utils.toPeb(1, 'KLAY'),
            gas: 900000,
        }
        // account update transaction object
        accountUpdateObject = {
            type: 'FEE_DELEGATED_ACCOUNT_UPDATE',
            from: testAccount.address,
            gas: 900000,
        }

        return caver.klay.sendTransaction(txObject)
    }

    before(function(done) {
        this.timeout(200000)
        caver = new Caver(testRPCURL)
        senderPrvKey =
            process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
                ? `0x${process.env.privateKey}`
                : process.env.privateKey

        payerPrvKey =
            process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
                ? `0x${process.env.privateKey2}`
                : process.env.privateKey2

        caver.klay.accounts.wallet.add(senderPrvKey)
        caver.klay.accounts.wallet.add(payerPrvKey)

        const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
        senderAddress = sender.address
        const payer = caver.klay.accounts.privateKeyToAccount(payerPrvKey)
        payerAddress = payer.address

        // Make testAccount for update testing (This will be used for key update)
        privateKey2 = caver.klay.accounts.create().privateKey
        publicKey2 = caver.klay.accounts.privateKeyToPublicKey(privateKey2)
        privateKey3 = caver.klay.accounts.create().privateKey
        publicKey3 = caver.klay.accounts.privateKeyToPublicKey(privateKey3)
        privateKey4 = caver.klay.accounts.create().privateKey
        publicKey4 = caver.klay.accounts.privateKeyToPublicKey(privateKey4)
        multisig = {
            threshold: 2,
            keys: [{ weight: 1, publicKey: publicKey2 }, { weight: 1, publicKey: publicKey3 }, { weight: 1, publicKey: publicKey4 }],
        }

        createTestAccount().then(() => done())
    })

    // Error from missing
    it('CAVERJS-UNIT-TX-265 : If transaction object missing from, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        delete tx.from

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"from" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-265 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        delete tx.from

        expect(() => caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
    }).timeout(200000)

    // UnnecessaryTo
    it('CAVERJS-UNIT-TX-266 : If transaction object has to, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey, to: senderAddress }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"to" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-266 : If transaction object has to, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey, to: senderAddress }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"to" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction')
    }).timeout(200000)

    // UnnecessaryValue
    it('CAVERJS-UNIT-TX-267 : If transaction object has value, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey, value: 1 }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"value" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-267 : If transaction object has value, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey, value: 1 }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"value" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction')
    }).timeout(200000)

    // MissingGas
    it('CAVERJS-UNIT-TX-268 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        delete tx.gas

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"gas" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-268 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        delete tx.gas

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
    }).timeout(200000)

    // MissingKey
    it('CAVERJS-UNIT-TX-269 : If transaction object missing key information, signTransaction should throw error', async () => {
        const tx = Object.assign({}, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('Missing key information with FEE_DELEGATED_ACCOUNT_UPDATE transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-269 : If transaction object missing key information, sendTransaction should throw error', () => {
        const tx = Object.assign({}, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('Missing key information with FEE_DELEGATED_ACCOUNT_UPDATE transaction')
    }).timeout(200000)

    // PublicKey
    it('CAVERJS-UNIT-TX-270 : If transaction object has only publicKey, update account with publicKey', async () => {
        const tx = Object.assign({ publicKey: publicKey3 }, accountUpdateObject)
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const feePayerTx = {
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        }
        const receipt = await caver.klay.sendTransaction(feePayerTx)
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const xy = caver.utils.xyPointFromPublicKey(publicKey3)
        expect(key.keyType).to.equals(2)
        expect(key.key.x).to.equals(xy[0])
        expect(key.key.y).to.equals(xy[1])

        caver.klay.accounts.wallet.updatePrivateKey(privateKey3, testAccount.address)
    }).timeout(200000)

    // PublicKeyLength64
    it('CAVERJS-UNIT-TX-272 : If compressed publicKey length is 64, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(32) }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('Invalid public key'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-272 : If compressed publicKey length is 64, sendTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(32) }, accountUpdateObject)

        await caver.klay
            .sendTransaction(tx)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('Invalid public key'))
    }).timeout(200000)

    // PublicKeyLength126
    it('CAVERJS-UNIT-TX-273 : If uncompressed publicKey length is 126, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(63) }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('Invalid public key'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-273 : If uncompressed publicKey length is 126, sendTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey: caver.utils.randomHex(63) }, accountUpdateObject)

        await caver.klay
            .sendTransaction(tx)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('Invalid public key'))
    }).timeout(200000)

    // Update with multisig.
    it('CAVERJS-UNIT-TX-274 : If transaction object has multisig, update account with multisig', async () => {
        const tx = Object.assign({ multisig }, accountUpdateObject)

        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        expect(key.keyType).to.equals(4)
        expect(key.key.threshold).to.equals(multisig.threshold)
        expect(key.key.keys.length).to.equals(multisig.keys.length)

        for (let i = 0; i < multisig.keys.length; i++) {
            const xy = caver.utils.xyPointFromPublicKey(multisig.keys[i].publicKey)
            expect(key.key.keys[i].weight).to.equals(multisig.keys[i].weight)
            expect(key.key.keys[i].key.x).to.equals(xy[0])
            expect(key.key.keys[i].key.y).to.equals(xy[1])
        }

        await createTestAccount()
    }).timeout(200000)

    // Update with multisig and publicKey.
    it('CAVERJS-UNIT-TX-275 : If transaction object has multisig and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-275 : If transaction object has multisig and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleTransactionKey.
    it('CAVERJS-UNIT-TX-276 : If transaction object has roleTransactionKey, update account with roleTransactionKey', async () => {
        let tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        tx.type = 'ACCOUNT_UPDATE'
        await caver.klay.sendTransaction(tx)
        caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

        tx = Object.assign({ roleTransactionKey: { publicKey: publicKey4 } }, accountUpdateObject)
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey4)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey2)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey3)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleTransactionKey and publicKey.
    it('CAVERJS-UNIT-TX-277 : If transaction object has roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-277 : If transaction object has roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleTransactionKey and multisig.
    it('CAVERJS-UNIT-TX-278 : If transaction object has roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-278 : If transaction object has roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleTransactionKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-279 : If transaction object has roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-279 : If transaction object has roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleAccountUpdateKey.
    it('CAVERJS-UNIT-TX-280 : If transaction object has roleAccountUpdateKey, update account with roleAccountUpdateKey', async () => {
        let tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        tx.type = 'ACCOUNT_UPDATE'
        await caver.klay.sendTransaction(tx)
        caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

        tx = Object.assign({ roleAccountUpdateKey: { publicKey: publicKey4 } }, accountUpdateObject)
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey4)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey3)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleAccountUpdateKey and roleTransactionKey.
    it('CAVERJS-UNIT-TX-281 : If transaction object has roleAccountUpdateKey and roleTransactionKey, update account with roleAccountUpdateKey and roleTransactionKey', async () => {
        let tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        tx.type = 'ACCOUNT_UPDATE'
        await caver.klay.sendTransaction(tx)
        caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

        tx = Object.assign({ roleTransactionKey: { publicKey: publicKey4 }, roleAccountUpdateKey: { publicKey } }, accountUpdateObject)
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey4)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey3)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleAccountUpdateKey and publicKey.
    it('CAVERJS-UNIT-TX-282 : If transaction object has roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-282 : If transaction object has roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleAccountUpdateKey and multisig.
    it('CAVERJS-UNIT-TX-283 : If transaction object has roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-283 : If transaction object has roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleAccountUpdateKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-284 : If transaction object has roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-284 : If transaction object has roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleAccountUpdateKey, roleTransactionKey and publicKey.
    it('CAVERJS-UNIT-TX-285 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-285 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleAccountUpdateKey, roleTransactionKey and multisig.
    it('CAVERJS-UNIT-TX-286 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-286 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleAccountUpdateKey, roleTransactionKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-287 : If transaction object has roleAccountUpdateKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-287 : If transaction object has roleAccountUpdateKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey.
    it('CAVERJS-UNIT-TX-288 : If transaction object has roleFeePayerKey, update account with roleFeePayerKey', async () => {
        let tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        tx.type = 'ACCOUNT_UPDATE'
        await caver.klay.sendTransaction(tx)
        caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

        tx = Object.assign({ roleFeePayerKey: { publicKey: publicKey4 } }, accountUpdateObject)
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey2)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey4)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleFeePayerKey and roleTransactionKey.
    it('CAVERJS-UNIT-TX-289 : If transaction object has roleFeePayerKey and roleTransactionKey, update account with roleFeePayerKey and roleTransactionKey', async () => {
        let tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        tx.type = 'ACCOUNT_UPDATE'
        await caver.klay.sendTransaction(tx)
        caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

        tx = Object.assign(
            { roleTransactionKey: { publicKey: publicKey3 }, roleFeePayerKey: { publicKey: publicKey4 } },
            accountUpdateObject
        )
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey3)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey2)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey4)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleFeePayerKey and roleAccountUpdateKey.
    it('CAVERJS-UNIT-TX-290 : If transaction object has roleFeePayerKey and roleAccountUpdateKey, update account with roleFeePayerKey and roleAccountUpdateKey', async () => {
        let tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        tx.type = 'ACCOUNT_UPDATE'
        await caver.klay.sendTransaction(tx)
        caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

        tx = Object.assign(
            { roleAccountUpdateKey: { publicKey: publicKey3 }, roleFeePayerKey: { publicKey: publicKey4 } },
            accountUpdateObject
        )
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey3)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey4)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey.
    it('CAVERJS-UNIT-TX-291 : If transaction object has roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey, update account with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey', async () => {
        const tx = Object.assign(
            {
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey: publicKey2 },
                roleFeePayerKey: { publicKey: publicKey3 },
            },
            accountUpdateObject
        )
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        const expectedTransactionKey = caver.utils.xyPointFromPublicKey(publicKey)
        const expectedUpdateKey = caver.utils.xyPointFromPublicKey(publicKey2)
        const expectedFeePayerKey = caver.utils.xyPointFromPublicKey(publicKey3)
        expect(key.keyType).to.equals(5)
        expect(key.key.length).to.equals(3)
        expect(key.key[0].key.x).to.equals(expectedTransactionKey[0])
        expect(key.key[0].key.y).to.equals(expectedTransactionKey[1])
        expect(key.key[1].key.x).to.equals(expectedUpdateKey[0])
        expect(key.key[1].key.y).to.equals(expectedUpdateKey[1])
        expect(key.key[2].key.x).to.equals(expectedFeePayerKey[0])
        expect(key.key[2].key.y).to.equals(expectedFeePayerKey[1])

        await createTestAccount()
    }).timeout(200000)

    // Update with roleFeePayerKey and publicKey.
    it('CAVERJS-UNIT-TX-292 : If transaction object has roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-292 : If transaction object has roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey and multisig.
    it('CAVERJS-UNIT-TX-293 : If transaction object has roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-293 : If transaction object has roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-294 : If transaction object has roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-294 : If transaction object has roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleFeePayerKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleTransactionKey and publicKey.
    it('CAVERJS-UNIT-TX-295 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-295 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleTransactionKey and multisig.
    it('CAVERJS-UNIT-TX-296 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-296 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleTransactionKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-297 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-297 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleAccountUpdateKey and publicKey.
    it('CAVERJS-UNIT-TX-298 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-298 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleAccountUpdateKey and multisig.
    it('CAVERJS-UNIT-TX-299 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-299 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-300 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-300 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey.
    it('CAVERJS-UNIT-TX-301 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-301 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig.
    it('CAVERJS-UNIT-TX-302 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-302 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-303 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-303 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey.
    it('CAVERJS-UNIT-TX-304 : If transaction object has failKey, update account with failKey', async () => {
        const tx = Object.assign({ failKey: true }, accountUpdateObject)
        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        expect(key.keyType).to.equals(3)

        await createTestAccount()
    }).timeout(200000)

    // Update with failKey and publicKey.
    it('CAVERJS-UNIT-TX-305 : If transaction object has failKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-305 : If transaction object has failKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey and multisig.
    it('CAVERJS-UNIT-TX-306 : If transaction object has failKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-306 : If transaction object has failKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-307 : If transaction object has failKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-307 : If transaction object has failKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey and roleTransactionKey.
    it('CAVERJS-UNIT-TX-308 : If transaction object has failKey and roleTransactionKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey } }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-308 : If transaction object has failKey and roleTransactionKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey } }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey and publicKey.
    it('CAVERJS-UNIT-TX-309 : If transaction object has failKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-309 : If transaction object has failKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey and multisig.
    it('CAVERJS-UNIT-TX-310 : If transaction object has failKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-310 : If transaction object has failKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-311 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-311 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleTransactionKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey and roleAccountUpdateKey.
    it('CAVERJS-UNIT-TX-312 : If transaction object has failKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey } }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-312 : If transaction object has failKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey } }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleAccountUpdateKey and publicKey.
    it('CAVERJS-UNIT-TX-313 : If transaction object has failKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-313 : If transaction object has failKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleAccountUpdateKey and multisig.
    it('CAVERJS-UNIT-TX-314 : If transaction object has failKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-314 : If transaction object has failKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleAccountUpdateKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-315 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-315 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleAccountUpdateKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey and roleFeePayerKey.
    it('CAVERJS-UNIT-TX-316 : If transaction object has failKey and roleFeePayerKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey } }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-316 : If transaction object has failKey and roleFeePayerKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey } }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleFeePayerKey and publicKey.
    it('CAVERJS-UNIT-TX-317 : If transaction object has failKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-317 : If transaction object has failKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey }, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleFeePayerKey and multisig.
    it('CAVERJS-UNIT-TX-318 : If transaction object has failKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-318 : If transaction object has failKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey }, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleFeePayerKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-319 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-319 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true, roleFeePayerKey: { publicKey }, publicKey, multisig }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleAccountUpdateKey and publicKey.
    it('CAVERJS-UNIT-TX-320 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-320 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleAccountUpdateKey and multisig.
    it('CAVERJS-UNIT-TX-321 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-321 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-322 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-322 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleAccountUpdateKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleFeePayerKey and publicKey.
    it('CAVERJS-UNIT-TX-323 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-323 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleFeePayerKey and multisig.
    it('CAVERJS-UNIT-TX-324 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-324 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-325 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-325 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleTransactionKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey.
    it('CAVERJS-UNIT-TX-326 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-326 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleAccountUpdateKey, roleFeePayerKey and multisig.
    it('CAVERJS-UNIT-TX-327 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-327 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-328 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-328 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            { failKey: true, roleAccountUpdateKey: { publicKey }, roleFeePayerKey: { publicKey }, publicKey, multisig },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey.
    it('CAVERJS-UNIT-TX-329 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey },
                roleFeePayerKey: { publicKey },
                publicKey,
            },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-329 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey },
                roleFeePayerKey: { publicKey },
                publicKey,
            },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig.
    it('CAVERJS-UNIT-TX-330 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey },
                roleFeePayerKey: { publicKey },
                multisig,
            },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-330 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey },
                roleFeePayerKey: { publicKey },
                multisig,
            },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig.
    it('CAVERJS-UNIT-TX-331 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey },
                roleFeePayerKey: { publicKey },
                publicKey,
                multisig,
            },
            accountUpdateObject
        )

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-331 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                failKey: true,
                roleTransactionKey: { publicKey },
                roleAccountUpdateKey: { publicKey },
                roleFeePayerKey: { publicKey },
                publicKey,
                multisig,
            },
            accountUpdateObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // UnnecessaryData
    it('CAVERJS-UNIT-TX-332 : If transaction object has data, signTransaction should throw error', async () => {
        const tx = Object.assign({ data: '0x68656c6c6f', publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"data" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-332 : If transaction object has data, sendTransaction should throw error', () => {
        const tx = Object.assign({ data: '0x68656c6c6f', publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"data" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction')
    }).timeout(200000)

    // Error feePayer missing (A check on the feePayer is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
    it('CAVERJS-UNIT-TX-333 : If transaction object missing feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)

        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        expect(() => caver.klay.sendTransaction({ senderRawTransaction: ret.rawTransaction })).to.throws(
            'The "feePayer" field must be defined for signing with feePayer!'
        )
    }).timeout(200000)

    // UnnecessaryFeeRatio
    it('CAVERJS-UNIT-TX-335 : If transaction object has feeRatio, signTransaction should throw error', async () => {
        const tx = Object.assign({ feeRatio: 20, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"feeRatio" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-335 : If transaction object has feeRatio, sendTransaction should throw error', () => {
        const tx = Object.assign({ feeRatio: 20, publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"feeRatio" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction')
    }).timeout(200000)

    // UnnecessaryCodeFormat
    it('CAVERJS-UNIT-TX-336 : If transaction object has codeFormat, signTransaction should throw error', async () => {
        const tx = Object.assign({ codeFormat: 'EVM', publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"codeFormat" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-336 : If transaction object has codeFormat, sendTransaction should throw error', () => {
        const tx = Object.assign({ codeFormat: 'EVM', publicKey }, accountUpdateObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"codeFormat" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE transaction')
    }).timeout(200000)

    // Update account with legacyKey
    it('CAVERJS-UNIT-TX-337 : If transaction object has only legacyKey, update account with legacyKey', async () => {
        const tx = Object.assign({ legacyKey: true }, accountUpdateObject)

        const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })
        expect(receipt.from).to.equals(tx.from)
        expect(receipt.status).to.be.true

        const key = await caver.klay.getAccountKey(receipt.from)
        expect(key.keyType).to.equals(1)
    }).timeout(200000)

    // LegacyKey with publicKey
    it('CAVERJS-UNIT-TX-338 : If transaction object has legacyKey and publicKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, publicKey }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-338 : If transaction object has legacyKey and publicKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, publicKey }, accountUpdateObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // LegacyKey with multisig
    it('CAVERJS-UNIT-TX-339 : If transaction object has legacyKey and multisig, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, multisig }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-339 : If transaction object has legacyKey and multisig, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, multisig }, accountUpdateObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // LegacyKey with failKey
    it('CAVERJS-UNIT-TX-340 : If transaction object has legacyKey and failKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, failKey: true }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-340 : If transaction object has legacyKey and failKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, failKey: true }, accountUpdateObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // LegacyKey with roleTransactionKey
    it('CAVERJS-UNIT-TX-341 : If transaction object has legacyKey and roleTransactionKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, roleTransactionKey: { publicKey } }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-341 : If transaction object has legacyKey and roleTransactionKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, roleTransactionKey: { publicKey } }, accountUpdateObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // LegacyKey with roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-342 : If transaction object has legacyKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, roleAccountUpdateKey: { publicKey } }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-342 : If transaction object has legacyKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, roleAccountUpdateKey: { publicKey } }, accountUpdateObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // LegacyKey with roleFeePayerKey
    it('CAVERJS-UNIT-TX-343 : If transaction object has legacyKey and roleFeePayerKey, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true, roleFeePayerKey: { publicKey } }, accountUpdateObject)

        await caver.klay.accounts
            .signTransaction(tx, testAccount.privateKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-343 : If transaction object has legacyKey and roleFeePayerKey, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true, roleFeePayerKey: { publicKey } }, accountUpdateObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            'The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE is duplicated.'
        )
    }).timeout(200000)

    // Invalid from address
    it('CAVERJS-UNIT-TX-597: If transaction object has invalid from, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        tx.from = 'invalidAddress'

        const expectedError = `Invalid address of from: ${tx.from}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-597: If transaction object has invalid from, sendTransaction should throw error', () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        tx.from = 'invalidAddress'

        const expectedError = `Provided address "${tx.from}" is invalid, the capitalization checksum test failed`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-598: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ publicKey, feePayerSignatures }, accountUpdateObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-598: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ publicKey, feePayerSignatures }, accountUpdateObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error with invalid feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-599: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, publicKey, feePayerSignatures }, accountUpdateObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-599: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, publicKey, feePayerSignatures }, accountUpdateObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error when feePayer is not defined with fee payer transaction format
    it('CAVERJS-UNIT-TX-600: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: '0x',
        }

        const expectedError = `Invalid fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-600: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: '0x',
        }

        // when sendTransaction, get account from wallet before calling signTransaction
        const expectedError = `Provided address "${feePayerTx.feePayer}" is invalid, the capitalization checksum test failed.`

        expect(() => caver.klay.sendTransaction(feePayerTx)).to.throws(expectedError)
    }).timeout(200000)

    // Error when feePayer is invalid with fee payer transaction format
    it('CAVERJS-UNIT-TX-601: If transaction object has invalid feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        const expectedError = `Invalid address of fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-601: If transaction object has invalid feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({ publicKey }, accountUpdateObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        // when sendTransaction, get account from wallet before calling signTransaction
        const expectedError = `Provided address "${feePayerTx.feePayer}" is invalid, the capitalization checksum test failed.`

        expect(() => caver.klay.sendTransaction(feePayerTx)).to.throws(expectedError)
    }).timeout(200000)

    // Update with key field with AccountKeyPublic.
    it('CAVERJS-UNIT-TX-685: If transaction object has key with AccountKeyPublic, update account with AccountKeyPublic', async () => {
        const key = caver.klay.accounts.create().privateKey
        const updator = caver.klay.accounts.createAccountForUpdate(testAccount.address, key)

        const tx = Object.assign({ key: updator }, accountUpdateObject)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
        expect(receipt.from).to.equals(tx.from)

        const accountKey = await caver.klay.getAccountKey(receipt.from)
        expect(accountKey.keyType).to.equals(2)

        await createTestAccount()
    }).timeout(200000)

    // Update with key field with AccountKeyMultiSig.
    it('CAVERJS-UNIT-TX-686: If transaction object has key with AccountKeyMultiSig, update account with AccountKeyMultiSig', async () => {
        const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
        const options = { threshold: 1, weight: [1, 1] }
        const updator = caver.klay.accounts.createAccountForUpdate(testAccount.address, key, options)

        const tx = Object.assign({ key: updator }, accountUpdateObject)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
        expect(receipt.from).to.equals(tx.from)

        const accountKey = await caver.klay.getAccountKey(receipt.from)
        expect(accountKey.keyType).to.equals(4)
        expect(accountKey.key.threshold).to.equals(options.threshold)
        expect(accountKey.key.keys.length).to.equals(key.length)

        await createTestAccount()
    }).timeout(200000)

    // Update with key field with AccountKeyRoleBased.
    it('CAVERJS-UNIT-TX-687: If transaction object has key with AccountKeyRoleBased, update account with AccountKeyRoleBased', async () => {
        const key = {
            transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            updateKey: caver.klay.accounts.create().privateKey,
            feePayerKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }
        const options = {
            transactionKey: { threshold: 2, weight: [1, 1] },
            feePayerKey: { threshold: 2, weight: [1, 1, 1] },
        }
        const updator = caver.klay.accounts.createAccountForUpdate(testAccount.address, key, options)

        const tx = Object.assign({ key: updator }, accountUpdateObject)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
        expect(receipt.from).to.equals(tx.from)

        const accountKey = await caver.klay.getAccountKey(receipt.from)
        expect(accountKey.keyType).to.equals(5)
        expect(accountKey.key.length).to.equals(3)
        expect(accountKey.key[0].keyType).to.equals(4)
        expect(accountKey.key[1].keyType).to.equals(2)
        expect(accountKey.key[2].keyType).to.equals(4)
        expect(accountKey.key[0].key.threshold).to.equals(options.transactionKey.threshold)
        expect(accountKey.key[2].key.threshold).to.equals(options.feePayerKey.threshold)
        expect(accountKey.key[0].key.keys.length).to.equals(key.transactionKey.length)
        expect(accountKey.key[2].key.keys.length).to.equals(key.feePayerKey.length)

        await createTestAccount()
    }).timeout(200000)

    // Update with key field with LegacyKey.
    it('CAVERJS-UNIT-TX-688: If transaction object has key with LegacyKey, update account with LegacyKey', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator }, accountUpdateObject)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
        expect(receipt.from).to.equals(tx.from)

        const accountKey = await caver.klay.getAccountKey(receipt.from)
        expect(accountKey.keyType).to.equals(1)

        await createTestAccount()
    }).timeout(200000)

    // Update with key field with FailKey.
    it('CAVERJS-UNIT-TX-689: If transaction object has key with FailKey, update account with FailKey', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithFailKey(testAccount.address)

        const tx = Object.assign({ key: updator }, accountUpdateObject)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
        expect(receipt.from).to.equals(tx.from)

        const accountKey = await caver.klay.getAccountKey(receipt.from)
        expect(accountKey.keyType).to.equals(3)

        await createTestAccount()
    }).timeout(200000)

    // Update with key field with AccountKeyRoleBased with legacyKey and failKey.
    it('CAVERJS-UNIT-TX-690: If transaction object has key with AccountKeyRoleBased, update account with AccountKeyRoleBased', async () => {
        const key = {
            transactionKey: 'legacyKey',
            updateKey: 'failKey',
            feePayerKey: 'legacyKey',
        }
        const updator = caver.klay.accounts.createAccountForUpdate(testAccount.address, key)

        const tx = Object.assign({ key: updator }, accountUpdateObject)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
        expect(receipt.from).to.equals(tx.from)

        const accountKey = await caver.klay.getAccountKey(receipt.from)
        expect(accountKey.keyType).to.equals(5)
        expect(accountKey.key.length).to.equals(3)
        expect(accountKey.key[0].keyType).to.equals(1)
        expect(accountKey.key[1].keyType).to.equals(3)
        expect(accountKey.key[2].keyType).to.equals(1)

        await createTestAccount()
    }).timeout(200000)

    // Duplication key check with key field
    it('CAVERJS-UNIT-TX-691: If transaction object has key with legacyKey field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, legacyKey: true }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-692: If transaction object has key with publicKey field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, publicKey }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-693: If transaction object has key with multisig field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, multisig }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-694: If transaction object has key with roleTransactionKey field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, roleTransactionKey: { publicKey } }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-695: If transaction object has key with roleAccountUpdateKey field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, roleAccountUpdateKey: { publicKey } }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-696: If transaction object has key with roleFeePayerKey field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, roleFeePayerKey: { publicKey } }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-697: If transaction object has key with failKey field, should throw error', async () => {
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(testAccount.address)

        const tx = Object.assign({ key: updator, failKey: true }, accountUpdateObject)

        const expectedError = `The key parameter to be used for ${tx.type} is duplicated.`

        expect(() => caver.klay.signTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-715: sendTransaction should throw error when try to use an account in Node with not LEGACY transaction', async () => {
        const acctInNode = caver.klay.accounts.create()
        const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(acctInNode.address)

        const tx = Object.assign({ key: updator }, accountUpdateObject)
        tx.from = acctInNode.address

        const expectedError = `No private key found in the caver-js wallet. Trying to use the Klaytn node's wallet, but it only supports legacy transactions. Please add private key of ${acctInNode.address.toLowerCase()} to the caver-js wallet.`

        try {
            await caver.klay.sendTransaction(tx, (error, result) => {
                expect(error).not.to.be.null
                expect(result).to.be.undefined
                expect(error.message).to.equals(expectedError)
            })
            assert(false)
        } catch (error) {
            expect(error.message).to.equals(expectedError)
        }
    }).timeout(100000)
})
