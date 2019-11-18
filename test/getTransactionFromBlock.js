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

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let senderPrvKey
let senderAddress
let receiver

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('get transaction from block', () => {
    it('should not throw an error with "genesis" default block', async () => {
        const firstTx = await caver.klay.getTransactionFromBlock('genesis', 0)
        expect(() => firstTx).not.to.throw()
    }).timeout(100000)

    it('should not throw an error with "earliest" default block', async () => {
        const firstTx = await caver.klay.getTransactionFromBlock('earliest', 0)
        expect(() => firstTx).not.to.throw()
    }).timeout(100000)

    it('should not throw an error with "latest" default block', async () => {
        const firstTx = await caver.klay.getTransactionFromBlock('latest', 0)
        expect(() => firstTx).not.to.throw()
    }).timeout(100000)

    it('should throw an error with invalid index', () => {
        const invalidIndex = 'invalid index'
        expect(() => caver.klay.getTransactionFromBlock('latest', invalidIndex)).to.throw(
            'Given input "',
            invalidIndex,
            '" is not a number.'
        )
    }).timeout(100000)

    it('should throw an error with invalid block number', () => {
        const invalidBlockNumber = 'invalidBlockNumber'
        expect(() => caver.klay.getTransactionFromBlock(invalidBlockNumber, 0)).to.throw(
            'Given input "',
            invalidBlockNumber,
            '"is not a number.'
        )
    }).timeout(100000)

    it('After sending transction, first tx should exist on the block', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }
        const receipt = await caver.klay.sendTransaction(txObj)

        const firstTx = await caver.klay.getTransactionFromBlock(receipt.blockNumber, 0)

        expect(firstTx.blockHash).not.to.undefined
        expect(firstTx.blockNumber).not.to.undefined
        expect(firstTx.from).not.to.undefined
        expect(firstTx.gas).not.to.undefined
        expect(firstTx.gasPrice).not.to.undefined
        expect(firstTx.hash).not.to.undefined
        expect(firstTx.nonce).not.to.undefined
        expect(firstTx.signatures).not.to.undefined
        expect(firstTx.to).not.to.undefined
        expect(firstTx.transactionIndex).not.to.undefined
        expect(firstTx.type).not.to.undefined
        expect(firstTx.typeInt).not.to.undefined
        expect(firstTx.value).not.to.undefined
    }).timeout(100000)
})
