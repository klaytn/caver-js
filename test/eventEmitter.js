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
const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

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
    senderAddress = caver.klay.accounts.privateKeyToAccount(senderPrvKey).address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('eventEmitter with transactionHash', () => {
    it('CAVERJS-UNIT-ETC-048: transactionHash event is called only with transactionHash.', () => {
        caver.klay
            .sendTransaction({
                from: senderAddress,
                to: receiver.address,
                value: 1,
                gas: 900000,
            })
            .on('transactionHash', hash => expect(typeof hash).to.equals('string'))
    }).timeout(10000)
})
