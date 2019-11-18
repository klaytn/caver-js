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

const { expect } = require('chai')
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

    caver.klay.accounts.wallet.add(senderPrvKey)
    caver.klay.accounts.wallet.add(payerPrvKey)

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
    const payer = caver.klay.accounts.privateKeyToAccount(payerPrvKey)
    payerAddress = payer.address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('get transaction', () => {
    it('CAVERJS-UNIT-TX-565 : getTransaction should return information of transaction.', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }
        const receipt = await caver.klay.sendTransaction(txObj)

        const tx = await caver.klay.getTransaction(receipt.transactionHash)

        expect(tx.blockHash).not.to.undefined
        expect(tx.blockNumber).not.to.undefined
        expect(tx.from).not.to.undefined
        expect(tx.gas).not.to.undefined
        expect(tx.gasPrice).not.to.undefined
        expect(tx.hash).not.to.undefined
        expect(tx.nonce).not.to.undefined
        expect(tx.signatures).not.to.undefined
        expect(tx.to).not.to.undefined
        expect(tx.transactionIndex).not.to.undefined
        expect(tx.type).not.to.undefined
        expect(tx.typeInt).not.to.undefined
        expect(tx.value).not.to.undefined
    }).timeout(10000)

    it('getTransaction should return error with invalid hash.', done => {
        caver.klay
            .getTransaction('invalidHash')
            .then(() => done(false))
            .catch(() => done())
    }).timeout(10000)
})

describe('get transaction by senderTxHash', () => {
    it('CAVERJS-UNIT-TX-566 : getTransactionBySenderTxHash should return information of transaction.', async () => {
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }
        const ret = await caver.klay.accounts.signTransaction(txObj, senderPrvKey)

        const receipt = await caver.klay.sendTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payerAddress,
        })

        expect(receipt.senderTxHash).not.to.undefined
        expect(receipt.transactionHash).not.to.equals(receipt.senderTxHash)

        const isEnable = await caver.klay.isSenderTxHashIndexingEnabled()
        if (isEnable) {
            const tx = await caver.klay.getTransactionBySenderTxHash(receipt.senderTxHash)
            expect(tx).not.to.null
        }
    }).timeout(10000)
})
