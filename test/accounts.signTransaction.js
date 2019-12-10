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

const assert = require('assert')
const { expect } = require('./extendedChai')

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let sender
let payer
let testAccount

before(() => {
    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey
    const payerPrvKey =
        process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
            ? `0x${process.env.privateKey2}`
            : process.env.privateKey2

    sender = caver.klay.accounts.wallet.add(senderPrvKey)
    payer = caver.klay.accounts.wallet.add(payerPrvKey)

    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('caver.klay.accounts.signTransaction', () => {
    it('CAVERJS-UNIT-TX-001 : should be rejected when data field is missing for contract creation tx', () => {
        const tx = {
            value: '1000000000',
            gas: 2000000,
        }

        expect(caver.klay.accounts.signTransaction(tx, testAccount.transactionKey)).to.eventually.rejected
    })

    it('CAVERJS-UNIT-WALLET-396: should set nonce with pending block tag', async () => {
        // given
        const baseNonce = await caver.klay.getTransactionCount(sender.address)
        const txConfig = {
            from: sender.address,
            to: testAccount.address,
            value: '0',
            gas: 30000,
        }

        let nonce1
        function sendTransactionTxHashHelper() {
            return new Promise((resolve, reject) => {
                caver.klay
                    .sendTransaction({ ...txConfig })
                    .on('transactionHash', transactionHash => {
                        resolve(transactionHash)
                    })
                    .on('receipt', receipt => {
                        nonce1 = caver.utils.hexToNumber(receipt.nonce)
                    })
            })
        }

        // when
        const transactionHash = await sendTransactionTxHashHelper()
        const receipt2 = await caver.klay.sendTransaction({ ...txConfig })
        const nonce2 = caver.utils.hexToNumber(receipt2.nonce)

        // then
        expect(nonce1).to.equals(baseNonce)
        expect(nonce2).to.equals(baseNonce + 1)
    })
})
