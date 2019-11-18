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

before(() => {
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

    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO transaction', () => {
    let feeDelegatedValueTransferMemoWithRatioObject

    beforeEach(() => {
        feeDelegatedValueTransferMemoWithRatioObject = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
            from: senderAddress,
            to: testAccount.address,
            value: 1,
            gas: 900000,
            feeRatio: 30,
            data: '0x68656c6c6f',
        }
    })

    it('If transaction object has all essential value, sendTransaction should not return error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(async ret => {
                await caver.klay
                    .sendTransaction({
                        senderRawTransaction: ret.rawTransaction,
                        feePayer: payerAddress,
                    })
                    .then(() => (result = true))
                    .catch(() => (result = false))
            })
            .catch(() => (result = false))

        expect(result).to.be.true
    }).timeout(200000)

    // Error from missing
    it('CAVERJS-UNIT-TX-094 : If transaction object missing from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.from

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-094 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.from

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error to missing
    it('CAVERJS-UNIT-TX-095 : If transaction object missing to, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.to

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-095 : If transaction object missing to, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.to

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error value missing
    it('CAVERJS-UNIT-TX-096 : If transaction object missing value, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.value

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-096 : If transaction object missing value, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.value

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error gas and gasLimit missing
    it('CAVERJS-UNIT-TX-097 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.gas

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-097 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.gas

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error data missing
    it('CAVERJS-UNIT-TX-098 : If transaction object missing data, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.data

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-098 : If transaction object missing data, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.data

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error feePayer missing (A check on the feePayer is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
    it('CAVERJS-UNIT-TX-099 : If transaction object missing feePayer, signTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)

        caver.klay.accounts.signTransaction(tx, senderPrvKey).then(ret => {
            expect(() => caver.klay.sendTransaction({ senderRawTransaction: ret.rawTransaction })).to.throws()
        })
    }).timeout(200000)

    // Error senderRawTransaction missing (A check on the senderRawTransaction is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
    it('CAVERJS-UNIT-TX-100 : If transaction object missing senderRawTransaction, signTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)

        caver.klay.accounts.signTransaction(tx, senderPrvKey).then(ret => {
            expect(() => caver.klay.sendTransaction({ feePayer: payerAddress })).to.throws()
        })
    }).timeout(200000)

    // Error feeRatio missing
    it('CAVERJS-UNIT-TX-101 : If transaction object missing feeRatio, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.feeRatio

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-101 : If transaction object missing feeRatio, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        delete tx.feeRatio

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary publicKey
    it('CAVERJS-UNIT-TX-102 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            feeDelegatedValueTransferMemoWithRatioObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-102 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            feeDelegatedValueTransferMemoWithRatioObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary multisig
    it('CAVERJS-UNIT-TX-103 : If transaction object has unnecessary multisig field, signTransaction should throw error', async () => {
        const multisig = {
            threshold: 3,
            keys: [
                {
                    weight: 1,
                    publicKey:
                        '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
                },
                {
                    weight: 1,
                    publicKey:
                        '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e',
                },
                {
                    weight: 1,
                    publicKey:
                        '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f',
                },
                {
                    weight: 1,
                    publicKey:
                        '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
                },
            ],
        }
        const tx = Object.assign({ multisig }, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-103 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
        const multisig = {
            threshold: 3,
            keys: [
                {
                    weight: 1,
                    publicKey:
                        '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
                },
                {
                    weight: 1,
                    publicKey:
                        '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e',
                },
                {
                    weight: 1,
                    publicKey:
                        '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f',
                },
                {
                    weight: 1,
                    publicKey:
                        '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
                },
            ],
        }
        const tx = Object.assign({ multisig }, feeDelegatedValueTransferMemoWithRatioObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary roleTransactionKey
    it('CAVERJS-UNIT-TX-104 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-104 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, feeDelegatedValueTransferMemoWithRatioObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-105 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-105 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, feeDelegatedValueTransferMemoWithRatioObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary roleFeePayerKey
    it('CAVERJS-UNIT-TX-106 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-106 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, feeDelegatedValueTransferMemoWithRatioObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary failKey
    it('CAVERJS-UNIT-TX-107 : If transaction object has unnecessary failKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true }, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-107 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true }, feeDelegatedValueTransferMemoWithRatioObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary codeFormat
    it('CAVERJS-UNIT-TX-108 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async () => {
        const tx = Object.assign({ codeFormat: 'EVM' }, feeDelegatedValueTransferMemoWithRatioObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))

        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-108 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
        const tx = Object.assign({ codeFormat: 'EVM' }, feeDelegatedValueTransferMemoWithRatioObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // UnnecessaryLegacyKey
    it('CAVERJS-UNIT-TX-564 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true }, feeDelegatedValueTransferMemoWithRatioObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-564 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true }, feeDelegatedValueTransferMemoWithRatioObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"legacyKey" cannot be used with FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // Invalid from address
    it('CAVERJS-UNIT-TX-657: If transaction object has invalid from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        tx.from = 'invalidAddress'

        const expectedError = `Invalid address of from: ${tx.from}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-657: If transaction object has invalid from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        tx.from = 'invalidAddress'

        const expectedError = `Provided address "${tx.from}" is invalid, the capitalization checksum test failed`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-658: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ feePayerSignatures }, feeDelegatedValueTransferMemoWithRatioObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-658: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ feePayerSignatures }, feeDelegatedValueTransferMemoWithRatioObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error with invalid feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-659: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, feePayerSignatures }, feeDelegatedValueTransferMemoWithRatioObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-659: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, feePayerSignatures }, feeDelegatedValueTransferMemoWithRatioObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // InvalidTo
    it('CAVERJS-UNIT-TX-660: If transaction object has invalid to address, signTransaction should throw error', async () => {
        const invalidTo = 'invalid'
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        tx.to = invalidTo

        const expectedError = `Invalid address of to: ${tx.to}`

        await expect(caver.klay.accounts.signTransaction(tx, senderPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-660: If transaction object has unnecessary feePayerSignatures, sendTransaction should throw error', () => {
        const invalidTo = 'invalid'
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        tx.to = invalidTo

        const expectedError = `Provided address "${tx.to}" is invalid, the capitalization checksum test failed.`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error when feePayer is not defined with fee payer transaction format
    it('CAVERJS-UNIT-TX-661: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: '0x',
        }

        const expectedError = `Invalid fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-661: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
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
    it('CAVERJS-UNIT-TX-662: If transaction object has invalid feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        const expectedError = `Invalid address of fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-662: If transaction object has invalid feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        // when sendTransaction, get account from wallet before calling signTransaction
        const expectedError = `Provided address "${feePayerTx.feePayer}" is invalid, the capitalization checksum test failed.`

        expect(() => caver.klay.sendTransaction(feePayerTx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-725: sendTransaction should throw error when try to use an account in Node with not LEGACY transaction', async () => {
        const acctInNode = caver.klay.accounts.create()

        const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
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
