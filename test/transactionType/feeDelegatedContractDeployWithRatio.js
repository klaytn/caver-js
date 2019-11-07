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
    if (process.env.privateKey && process.env.privateKey2) {
        senderPrvKey =
            process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
                ? `0x${process.env.privateKey}`
                : process.env.privateKey
        payerPrvKey =
            process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
                ? `0x${process.env.privateKey2}`
                : process.env.privateKey2

        const sender = caver.klay.accounts.wallet.add(senderPrvKey)
        const payer = caver.klay.accounts.wallet.add(payerPrvKey)

        senderAddress = sender.address
        payerAddress = payer.address
    } else {
        const sender = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
        senderPrvKey = sender.privateKey
        senderAddress = sender.address
    }

    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction', () => {
    let deployObject

    beforeEach(() => {
        deployObject = {
            type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
            from: senderAddress,
            value: 0,
            gas: 900000,
            data:
                '0x608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029',
            feeRatio: 30,
        }
    })

    // MissingFrom
    it('CAVERJS-UNIT-TX-452 : If transaction object missing from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        delete tx.from

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"from" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-452 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, deployObject)
        delete tx.from

        expect(() => caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
    }).timeout(200000)

    // MissingValue
    it('CAVERJS-UNIT-TX-453 : If transaction object missing value, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        delete tx.value

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"value" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-453 : If transaction object missing from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, deployObject)
        delete tx.value

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"value" is missing')
    }).timeout(200000)

    // Missing gas and gasLimit
    it('CAVERJS-UNIT-TX-454 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        delete tx.gas

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"gas" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-454 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
        const tx = Object.assign({}, deployObject)
        delete tx.gas

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
    }).timeout(200000)

    // MissingData
    it('CAVERJS-UNIT-TX-455 : If transaction object missing data, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        delete tx.data

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"data" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-455 : If transaction object missing data, sendTransaction should throw error', () => {
        const tx = Object.assign({}, deployObject)
        delete tx.data

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"data" is missing')
    }).timeout(200000)

    // InvalidCodeFormat
    it('CAVERJS-UNIT-TX-456 : If transaction object has invalid codeFormat, signTransaction should throw error', async () => {
        const tx = Object.assign({ codeFormat: 'InvalidCodeFormat' }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('The codeFormat(InvalidCodeFormat) is invalid.'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-456 : If transaction object has invalid codeFormat, sendTransaction should throw error', () => {
        const tx = Object.assign({ codeFormat: 'InvalidCodeFormat' }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws('The codeFormat(InvalidCodeFormat) is invalid.')
    }).timeout(200000)

    // MissingFeePayer
    it('CAVERJS-UNIT-TX-457 : If transaction object missing feePayer field, should throw error', async () => {
        const tx = Object.assign({}, deployObject)

        const ret = await caver.klay.accounts.signTransaction(tx, senderPrvKey)

        expect(() => caver.klay.sendTransaction({ senderRawTransaction: ret.rawTransaction })).to.throws(
            'The "feePayer" field must be defined for signing with feePayer!'
        )
    }).timeout(200000)

    // MissingFeeRatio
    it('CAVERJS-UNIT-TX-459 : If transaction object missing feeRatio field, signTransaction should throw error', async () => {
        const tx = Object.assign(deployObject)
        delete tx.feeRatio

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err => expect(err.message).to.equals('"feeRatio" is missing'))
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-459 : If transaction object missing feeRatio field, sendTransaction should throw error', () => {
        const tx = Object.assign(deployObject)
        delete tx.feeRatio

        expect(() => caver.klay.sendTransaction(tx)).to.throws('"feeRatio" is missing')
    }).timeout(200000)

    // UnnecessaryPublicKey
    it('CAVERJS-UNIT-TX-460 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            deployObject
        )

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-460 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
        const tx = Object.assign(
            {
                publicKey:
                    '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4',
            },
            deployObject
        )

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryMultisig
    it('CAVERJS-UNIT-TX-461 : If transaction object has unnecessary multisig field, signTransaction should throw error', async () => {
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
        const tx = Object.assign({ multisig }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-461 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
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
        const tx = Object.assign({ multisig }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryRoleTransactionKey
    it('CAVERJS-UNIT-TX-462 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-462 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
        const roleTransactionKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleTransactionKey }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryRoleAccountUpdateKey
    it('CAVERJS-UNIT-TX-463 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-463 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleAccountUpdateKey }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryRoleFeePayerKey
    it('CAVERJS-UNIT-TX-464 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals(
                    '"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
                )
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-464 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
        const roleFeePayerKey = {
            publicKey:
                '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
        }
        const tx = Object.assign({ roleFeePayerKey }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryFailKey
    it('CAVERJS-UNIT-TX-465 : If transaction object has unnecessary failKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ failKey: true }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-465 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ failKey: true }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryLegacyKey
    it('CAVERJS-UNIT-TX-466 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async () => {
        const tx = Object.assign({ legacyKey: true }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-466 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
        const tx = Object.assign({ legacyKey: true }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    // UnnecessaryTo
    it('CAVERJS-UNIT-TX-571 : If transaction object has unnecessary to field, signTransaction should throw error', async () => {
        const tx = Object.assign({ to: '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5' }, deployObject)

        await caver.klay.accounts
            .signTransaction(tx, senderPrvKey)
            .then(() => assert(false))
            .catch(err =>
                expect(err.message).to.equals('"to" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction')
            )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-571 : If transaction object has unnecessary to field, sendTransaction should throw error', () => {
        const tx = Object.assign({ to: '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5' }, deployObject)

        expect(() => caver.klay.sendTransaction(tx)).to.throws(
            '"to" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO transaction'
        )
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-580: If data field of transaction is not 0x-hex prefixed, signTransaction should formatting and sign', async () => {
        deployObject.data = caver.utils.stripHexPrefix(deployObject.data)
        expect(deployObject.data.slice(0, 2) !== '0x').to.be.true

        const { rawTransaction } = await caver.klay.accounts.signTransaction(deployObject, senderPrvKey)

        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: rawTransaction,
            feePayer: payerAddress,
        })

        expect(receipt.status).to.be.true
    }).timeout(200000)

    // Invalid from address
    it('CAVERJS-UNIT-TX-622: If transaction object has invalid from, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        tx.from = 'invalidAddress'

        const expectedError = `Invalid address of from: ${tx.from}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-622: If transaction object has invalid from, sendTransaction should throw error', () => {
        const tx = Object.assign({}, deployObject)
        tx.from = 'invalidAddress'

        const expectedError = `Provided address "${tx.from}" is invalid, the capitalization checksum test failed`

        // Throw error from formatter validation
        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-623: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ feePayerSignatures }, deployObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-623: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const tx = Object.assign({ feePayerSignatures }, deployObject)

        const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error with invalid feePayer missing when feePayerSignatures is defined in transaction object
    it('CAVERJS-UNIT-TX-624: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, feePayerSignatures }, deployObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        await expect(caver.klay.accounts.signTransaction(tx, testAccount.privateKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-624: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const feePayerSignatures = [
            [
                '0x26',
                '0x984e9d43c496ef39ef2d496c8e1aee695f871e4f6cfae7f205ddda1589ca5c9e',
                '0x46647d1ce8755cd664f5fb4eba3082dd1a13817488029f3869662986b7b1a5ae',
            ],
        ]
        const invalidFeePayer = 'feePayer'
        const tx = Object.assign({ feePayer: invalidFeePayer, feePayerSignatures }, deployObject)

        const expectedError = `Invalid address of fee payer: ${invalidFeePayer}`

        expect(() => caver.klay.sendTransaction(tx)).to.throws(expectedError)
    }).timeout(200000)

    // Error when feePayer is not defined with fee payer transaction format
    it('CAVERJS-UNIT-TX-625: If transaction object missing feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: '0x',
        }

        const expectedError = `Invalid fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-625: If transaction object missing feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
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
    it('CAVERJS-UNIT-TX-626: If transaction object has invalid feePayer, signTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        const expectedError = `Invalid address of fee payer: ${feePayerTx.feePayer}`

        await expect(caver.klay.accounts.signTransaction(feePayerTx, payerPrvKey)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-626: If transaction object has invalid feePayer, sendTransaction should throw error', async () => {
        const tx = Object.assign({}, deployObject)
        const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)

        const feePayerTx = {
            senderRawTransaction: rawTransaction,
            feePayer: 'invalid',
        }

        // when sendTransaction, get account from wallet before calling signTransaction
        const expectedError = `Provided address "${feePayerTx.feePayer}" is invalid, the capitalization checksum test failed.`

        expect(() => caver.klay.sendTransaction(feePayerTx)).to.throws(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-720: sendTransaction should throw error when try to use an account in Node with not LEGACY transaction', async () => {
        const acctInNode = caver.klay.accounts.create()

        const tx = Object.assign({}, deployObject)
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
