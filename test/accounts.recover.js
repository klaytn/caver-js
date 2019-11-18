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

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

describe('caver.klay.accounts.recover', done => {
    it('CAVERJS-UNIT-WALLET-019 : should have same value for 3 different arguments definition', () => {
        /**
         * 3 different arguments definition for `caver.klay.accounts.recover`
         * a. recover with signed object.
         * b. recover with message, signature
         * c. recover with message, v, r, s
         */

        const caver = new Caver(testRPCURL)

        const message = 'Some data'

        const privateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318'
        const account = caver.klay.accounts.privateKeyToAccount(privateKey)

        const signed = caver.klay.accounts.sign('Some data', privateKey)

        const { signature, v, r, s } = signed

        expect(caver.klay.accounts.recover(signed)).to.equal(caver.klay.accounts.recover(message, signature))
        expect(caver.klay.accounts.recover(signed)).to.equal(caver.klay.accounts.recover(message, v, r, s))
    })

    it('CAVERJS-UNIT-WALLET-020 : messageHash argument can be used as a first argument with preFixed = true', () => {
        const caver = new Caver(testRPCURL)

        const privateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318'
        const signed = caver.klay.accounts.sign('Some data', privateKey)

        const { messageHash, signature, v, r, s } = signed

        expect(caver.klay.accounts.recover(messageHash, signature, true)).to.equal(caver.klay.accounts.recover(signed))
    })
})
