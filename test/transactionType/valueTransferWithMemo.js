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

    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('VALUE_TRANSFER_MEMO transaction', () => {
    let valueTransferMemoObject

    beforeEach(() => {
        valueTransferMemoObject = {
            type: 'VALUE_TRANSFER_MEMO',
            from: senderAddress,
            to: testAccount.address,
            value: 1,
            gas: 900000,
            data: '0x68656c6c6f',
        }
    })

    it('If transaction object has all essential value, sendTransaction should not return error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)

        let result
        await caver.klay
            .sendTransaction(tx)
            .then(() => (result = true))
            .catch(() => (result = false))
        expect(result).to.be.true
    }).timeout(200000)

    // Error from missing
    it('CAVERJS-UNIT-TX-065 : If transaction object missing from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.from

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-065 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.from

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error to missing
    it('CAVERJS-UNIT-TX-066 : If transaction object missing to, signTransaction should throw error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.to

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-066 : If transaction object missing to, sendTransaction should throw error', () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.to

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error value missing
    it('CAVERJS-UNIT-TX-067 : If transaction object missing value, signTransaction should throw error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.value

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-067 : If transaction object missing value, sendTransaction should throw error', () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.value

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error gas and gasLimit missing
    it('CAVERJS-UNIT-TX-068 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.gas

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-068 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.gas

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error data missing
    it('CAVERJS-UNIT-TX-069 : If transaction object missing data, signTransaction should throw error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.data

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-069 : If transaction object missing data, sendTransaction should throw error', () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        delete tx.data

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary feePayer
    it('CAVERJS-UNIT-TX-070 : If transaction object has unnecessary feePayer field, signTransaction should throw error', async () => {
        const tx = Object.assign({ feePayer: testAccount.address }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-070 : If transaction object has unnecessary feePayer field, sendTransaction should throw error', () => {
        const tx = Object.assign({ feePayer: testAccount.address }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary feeRatio
    it('CAVERJS-UNIT-TX-071 : If transaction object has unnecessary feeRatio field, signTransaction should throw error', async () => {
        const tx = Object.assign({ feeRatio: 20 }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-071 : If transaction object has unnecessary feeRatio field, sendTransaction should throw error', () => {
        const tx = Object.assign({ feeRatio: 20 }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary publicKey
    it('CAVERJS-UNIT-TX-072 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            valueTransferMemoObject
        )

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-072 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            valueTransferMemoObject
        )

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary multisig
    it('CAVERJS-UNIT-TX-073 : If transaction object has unnecessary multisig field, signTransaction should throw error', async () => {
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
        const tx = Object.assign({ multisig }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-073 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
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
        const tx = Object.assign({ multisig }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary roleTransactionKey
    it('CAVERJS-UNIT-TX-074 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-074 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary roleAccountUpdateKey
    it('CAVERJS-UNIT-TX-075 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-075 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary roleFeePayerKey
    it('CAVERJS-UNIT-TX-076 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-076 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary failKey
    it('CAVERJS-UNIT-TX-077 : If transaction object has unnecessary failKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-077 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // Error unnecessary codeFormat
    it('CAVERJS-UNIT-TX-078 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async () => {
        const tx = Object.assign({ codeFormat: 'EVM' }, valueTransferMemoObject)

        let result
        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => (result = false))
            .catch(() => (result = true))
        expect(result).to.be.true
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-078 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
        const tx = Object.assign({ codeFormat: 'EVM' }, valueTransferMemoObject)

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws()
    }).timeout(200000)

    // UnnecessaryLegacyKey
    it('CAVERJS-UNIT-TX-562 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true }, valueTransferMemoObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"legacyKey" cannot be used with VALUE_TRANSFER_MEMO transaction'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-562 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true }, valueTransferMemoObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with VALUE_TRANSFER_MEMO transaction')
    }).timeout(200000)

    // Invalid from address
    it('CAVERJS-UNIT-TX-669: If transaction object has invalid from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        tx.from = 'invalidAddress'

        const expectedError = `Invalid address of from: ${tx.from}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-669: If transaction object has invalid from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, valueTransferMemoObject)
        tx.from = 'invalidAddress'

        const expectedError = `Provided address "${tx.from}" is invalid, the capitalization checksum test failed`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // UnnecessaryFeePayerSignatures
    it('CAVERJS-UNIT-TX-670: If transaction object has unnecessary feePayerSignatures, signTransaction should throw error', async () => {
        const tx = Object.assign({ feePayerSignatures: [['0x01', '0x', '0x']] }, valueTransferMemoObject)

        const expectedError = `"feePayerSignatures" cannot be used with ${tx.type} transaction`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-670: If transaction object has unnecessary feePayerSignatures, sendTransaction should throw error', () => {
        const tx = Object.assign({ feePayerSignatures: [['0x01', '0x', '0x']] }, valueTransferMemoObject)

        const expectedError = `"feePayerSignatures" cannot be used with ${tx.type} transaction`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // InvalidTo
    it('CAVERJS-UNIT-TX-671: If transaction object has invalid to address, signTransaction should throw error', async () => {
        const invalidTo = 'invalid'
        const tx = Object.assign({}, valueTransferMemoObject)
        tx.to = invalidTo

        const expectedError = `Invalid address of to: ${tx.to}`

        await expect(caver.klay.accounts.signTransaction(tx, senderPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-671: If transaction object has unnecessary feePayerSignatures, sendTransaction should throw error', () => {
        const invalidTo = 'invalid'
        const tx = Object.assign({}, valueTransferMemoObject)
        tx.to = invalidTo

        const expectedError = `Provided address "${tx.to}" is invalid, the capitalization checksum test failed.`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-728: sendTransaction should throw error when try to use an account in Node with not LEGACY transaction', async () => {
        const acctInNode = caver.klay.accounts.create()

        const tx = Object.assign({}, valueTransferMemoObject)
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
