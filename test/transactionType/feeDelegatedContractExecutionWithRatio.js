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
let senderAddress
let senderPrvKey
let payerPrvKey
let testAccount

describe('FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction', () => {
    let executionObject
    let contractAddress

    const deployContract = async () => {
        const deployTx = {
            type: 'SMART_CONTRACT_DEPLOY',
            from: senderAddress,
            value: 0,
            gas: 900000,
            data:
                '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000',
        }

        const receipt = await caver.klay.sendTransaction(deployTx)
        contractAddress = receipt.contractAddress
        executionObject.to = contractAddress
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

        const sender = caver.klay.accounts.wallet.add(senderPrvKey)
        senderAddress = sender.address

        testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

        executionObject = {
            type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
            from: senderAddress,
            gas: '0x3b9ac9ff',
            data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
            feeRatio: 20,
        }
        deployContract().then(() => done())
    })

    // MissingFrom
    it('CAVERJS-UNIT-TX-496 : If transaction object missing from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        delete tx.from

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"from" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-496 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, executionObject)
        delete tx.from

        expect(() => caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
    }).timeout(200000)

    // MissingTo
    it('CAVERJS-UNIT-TX-497 : If transaction object missing to, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        delete tx.to

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"to" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-497 : If transaction object missing to, sendTransaction should throw error', () => {
        const tx = Object.assign({}, executionObject)
        delete tx.to

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"to" is missing')
    }).timeout(200000)

    // Missing gas and gasLimit
    it('CAVERJS-UNIT-TX-498 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        delete tx.gas

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"gas" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-498 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
        const tx = Object.assign({}, executionObject)
        delete tx.gas

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
    }).timeout(200000)

    // MissingData
    it('CAVERJS-UNIT-TX-499 : If transaction object missing data, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        delete tx.data

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"data" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-499 : If transaction object missing data, sendTransaction should throw error', () => {
        const tx = Object.assign({}, executionObject)
        delete tx.data

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"data" is missing')
    }).timeout(200000)

    // MissingFeePayer
    it('CAVERJS-UNIT-TX-500 : If transaction object missing feePayer, should throw error', async () => {
        const tx = Object.assign({}, executionObject)

        const ret = await caver.klay.accounts.signTransaction(tx, senderPrvKey)
        expect(() => caver.klay.sendTransaction({ senderRawTransaction: ret.rawTransaction })).to.throws(
            'The "feePayer" field must be defined for signing with feePayer!'
        )
    }).timeout(200000)

    // MissingFeeRatio
    it('CAVERJS-UNIT-TX-502 : If transaction object missing feeRatio, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        delete tx.feeRatio

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"feeRatio" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-502 : If transaction object missing feeRatio, sendTransaction should throw error', () => {
        const tx = Object.assign({}, executionObject)
        delete tx.feeRatio

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"feeRatio" is missing')
    }).timeout(200000)

    // UnnecessaryPublicKey
    it('CAVERJS-UNIT-TX-503 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            executionObject
        )

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-503 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            executionObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryMultisig
    it('CAVERJS-UNIT-TX-504 : If transaction object has unnecessary multisig field, signTransaction should throw error', async () => {
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
        const tx = Object.assign({ multisig }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-504 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
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
        const tx = Object.assign({ multisig }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryRoleTransactionKey
    it('CAVERJS-UNIT-TX-505 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-505 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryRoleAccountUpdateKey
    it('CAVERJS-UNIT-TX-506 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-506 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryRoleFeePayerKey
    it('CAVERJS-UNIT-TX-507 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-507 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryFailKey
    it('CAVERJS-UNIT-TX-508 : If transaction object has unnecessary failKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-508 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryCodeFormat
    it('CAVERJS-UNIT-TX-509 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async () => {
        const tx = Object.assign({ codeFormat: 'EVM' }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"codeFormat" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-509 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
        const tx = Object.assign({ codeFormat: 'EVM' }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"codeFormat" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryLegacyKey
    it('CAVERJS-UNIT-TX-510 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true }, executionObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-510 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true }, executionObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // Invalid from address
    it('CAVERJS-UNIT-TX-633: If transaction object has invalid from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        tx.from = 'invalidAddress'

        const expectedError = `Invalid address of from: ${tx.from}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-633: If transaction object has invalid from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, executionObject)
        tx.from = 'invalidAddress'

        const expectedError = `Provided address "${tx.from}" is invalid, the capitalization checksum test failed`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-634: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ feePayerSignatures }, executionObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-634: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ feePayerSignatures }, executionObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error with invalid feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-635: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, feePayerSignatures }, executionObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-635: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, feePayerSignatures }, executionObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // InvalidTo
    it('CAVERJS-UNIT-TX-636: If transaction object has invalid to address, signTransaction should throw error', async () => {
        const invalidTo = 'invalid'
        const tx = Object.assign({}, executionObject)
        tx.to = invalidTo

        const expectedError = `Invalid address of to: ${tx.to}`

        await expect(caver.klay.accounts.signTransaction(tx, senderPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-636: If transaction object has unnecessary feePayerSignatures, sendTransaction should throw error', () => {
        const invalidTo = 'invalid'
        const tx = Object.assign({}, executionObject)
        tx.to = invalidTo

        const expectedError = `Provided address "${tx.to}" is invalid, the capitalization checksum test failed.`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error when feePayer is not defined with fee payer transaction format
    it('CAVERJS-UNIT-TX-637: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: '0x',
        }

        const expectedError = `Invalid fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-637: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
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
    it('CAVERJS-UNIT-TX-638: If transaction object has invalid feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        const expectedError = `Invalid address of fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-638: If transaction object has invalid feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({}, executionObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        // when sendTransaction, get account from wallet before calling signTransaction
        const expectedError = `Provided address "${feePayerTx.feePayer}" is invalid, the capitalization checksum test failed.`

        expect(() => caver.klay.sendTransaction(feePayerTx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-722: sendTransaction should throw error when try to use an account in Node with not LEGACY transaction', async () => {
        const acctInNode = caver.klay.accounts.create()

        const tx = Object.assign({}, executionObject)
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
