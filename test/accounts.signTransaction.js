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

    it('CAVERJS-UNIT-WALLET-396: should set nonce with pending block tag', done => {
        let doneCount = 0
        let blockNumber = -1
        function countDone(num) {
            doneCount++
            if (blockNumber === -1) blockNumber = num
            if (doneCount >= 2) {
                if (blockNumber !== num) return compareNonce()
                done()
            }
        }

        compareNonce()

        function compareNonce() {
            caver.klay.getTransactionCount(sender.address).then(baseNonce => {
                caver.klay
                    .sendTransaction({
                        from: sender.address,
                        to: testAccount.address,
                        value: '1',
                        gas: 30000,
                    })
                    .on('transactionHash', hash1 => {
                        caver.klay
                            .sendTransaction({
                                from: sender.address,
                                to: testAccount.address,
                                value: '1',
                                gas: 30000,
                            })
                            .on('receipt', r2 => {
                                const nonceInReceipt = caver.utils.hexToNumber(r2.nonce)
                                expect(nonceInReceipt).to.equals(baseNonce + 1)
                                countDone(r2.blockNumber)
                            })
                            .on('error', e => {
                                assert(false)
                                done()
                            })
                    })
                    .on('receipt', r1 => {
                        const nonceInReceipt = caver.utils.hexToNumber(r1.nonce)
                        expect(nonceInReceipt).to.equals(baseNonce)
                        countDone(r1.blockNumber)
                    })
                    .on('error', e => {
                        assert(false)
                        done()
                    })
            })
        }
    }).timeout(200000)
})
