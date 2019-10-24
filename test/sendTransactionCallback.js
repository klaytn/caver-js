/*
    Copyright 2019 The caver-js Authors
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
const assert = require('assert')

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

    const sender = caver.klay.accounts.wallet.add(senderPrvKey)
    senderAddress = sender.address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('sendTransaction with callback', () => {
    it('CAVERJS-UNIT-TX-574: sendTransaction should only call callback once with the transaction hash', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }
        await caver.klay.sendTransaction(txObj, (error, result) => {
            expect(error).to.be.null
            expect(typeof result).to.be.equals('string')
        })
    }).timeout(100000)

    it('CAVERJS-UNIT-TX-575: sendTransaction should call callback with error when error is occured during signTransaction', async () => {
        // When try account update with invalid publicKey, error is occured during signTransaction
        let e
        const txObj = {
            type: 'ACCOUNT_UPDATE',
            from: senderAddress,
            publicKey: caver.utils.randomHex(63),
            gas: 900000,
        }

        try {
            await caver.klay.sendTransaction(txObj, (error, result) => {
                e = error.message
                expect(error).not.to.be.null
                expect(result).to.be.undefined
            })
            assert(false)
        } catch (error) {
            expect(error.message).to.equals(e)
        }
    }).timeout(100000)
})
