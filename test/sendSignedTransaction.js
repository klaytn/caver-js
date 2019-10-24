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

const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')
const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

let senderPrvKey
let payerPrvKey
let senderAddress
let payerAddress
let receiver

before(() => {
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
    const payer = caver.klay.accounts.wallet.add(payerPrvKey)
    payerAddress = payer.address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('CAVERJS-UNIT-TX-581: caver.klay.sendSignedTransaction with valid non fee delegated transaction raw string', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const { rawTransaction } = await caver.klay.accounts.signTransaction(txObj, senderPrvKey)
        const receipt = await caver.klay.sendSignedTransaction(rawTransaction)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'input',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).to.equals(receipt.transactionHash)
    }).timeout(100000)
})

describe('CAVERJS-UNIT-TX-582: caver.klay.sendSignedTransaction with valid fee delegated transaction raw string', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const senderSigned = await caver.klay.accounts.signTransaction(txObj)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(senderSigned.rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned.rawTransaction)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'feePayer',
            'feePayerSignatures',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).not.to.equals(receipt.transactionHash)
    }).timeout(100000)
})

describe('CAVERJS-UNIT-TX-583: caver.klay.sendSignedTransaction with object which has non fee delegated transaction raw string', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const senderSigned = await caver.klay.accounts.signTransaction(txObj, senderPrvKey)
        const receipt = await caver.klay.sendSignedTransaction(senderSigned)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'input',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).to.equals(receipt.transactionHash)
    }).timeout(100000)
})

describe('CAVERJS-UNIT-TX-584: caver.klay.sendSignedTransaction with object which has fee delegated transaction raw string', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const senderSigned = await caver.klay.accounts.signTransaction(txObj)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(senderSigned.rawTransaction, payerAddress)

        const receipt = await caver.klay.sendSignedTransaction(feePayerSigned)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'feePayer',
            'feePayerSignatures',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).not.to.equals(receipt.transactionHash)
    }).timeout(100000)
})

describe('CAVERJS-UNIT-TX-585: caver.klay.sendSignedTransaction with transaction object which defines signatures', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const senderSigned = await caver.klay.accounts.signTransaction(txObj, senderPrvKey)
        txObj.signatures = senderSigned.signatures

        const receipt = await caver.klay.sendSignedTransaction(txObj)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'input',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).to.equals(receipt.transactionHash)
    }).timeout(100000)
})

describe('CAVERJS-UNIT-TX-586: caver.klay.sendSignedTransaction with transaction object which defines signatures and feePayerSignatrues', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const senderSigned = await caver.klay.accounts.signTransaction(txObj)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObj, payerAddress)

        txObj.signatures = senderSigned.signatures
        txObj.feePayer = payerAddress
        txObj.feePayerSignatures = feePayerSigned.feePayerSignatures

        const receipt = await caver.klay.sendSignedTransaction(txObj)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'feePayer',
            'feePayerSignatures',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).not.to.equals(receipt.transactionHash)
    }).timeout(100000)
})

describe('CAVERJS-UNIT-TX-587: caver.klay.sendSignedTransaction with fee payer transaction object which defines feePayerSignatrues', () => {
    it('should send successfully with valid rawTransaction', async () => {
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }

        const senderSigned = await caver.klay.accounts.signTransaction(txObj)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(senderSigned.rawTransaction, payerAddress)

        const feePayerTx = {
            senderRawTransaction: senderSigned.rawTransaction,
            feePayer: payerAddress,
            feePayerSignatures: feePayerSigned.feePayerSignatures,
        }

        const receipt = await caver.klay.sendSignedTransaction(feePayerTx)

        expect(receipt).not.to.null

        const keys = [
            'blockHash',
            'blockNumber',
            'contractAddress',
            'feePayer',
            'feePayerSignatures',
            'from',
            'gas',
            'gasPrice',
            'gasUsed',
            'logs',
            'logsBloom',
            'nonce',
            'senderTxHash',
            'signatures',
            'status',
            'to',
            'transactionHash',
            'transactionIndex',
            'type',
            'typeInt',
            'value',
        ]
        expect(Object.getOwnPropertyNames(receipt)).to.deep.equal(keys)

        expect(receipt.status).to.equals(true)
        expect(receipt.senderTxHash).not.to.equals(receipt.transactionHash)
    }).timeout(100000)
})
