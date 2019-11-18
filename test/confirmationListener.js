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
const fetch = require('node-fetch')

const testRPCURL = require('./testrpc')
const Caver = require('../index.js')

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

describe('send transaction with confirmation listener', () => {
    it('CAVERJS-UNIT-ETC-001 : confirmation listener should not work', done => {
        const sent = caver.klay
            .sendTransaction({
                type: 'VALUE_TRANSFER',
                from: senderAddress,
                to: testAccount.address,
                value: 1,
                gas: 900000,
            })
            .on('confirmation', nothingHappend => expect(nothingHappend).to.equal(null))

        // If nothing happened during 10s,
        // We can gurantee 'confirmation' listener doesn't working.
        setTimeout(() => {
            // Emit "Nothing happened"
            sent.emit('confirmation', null)
            done()
        }, 10000)
    }).timeout(20000)
})
