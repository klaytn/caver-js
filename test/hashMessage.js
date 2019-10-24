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

describe('caver.klay.accounts.hashMessage', done => {
    it('CAVERJS-UNIT-ETC-003 : should have same value with utf8ToHex', async () => {
        const caver = new Caver(testRPCURL)

        const rawStringHashed = caver.klay.accounts.hashMessage('Hello World')
        const hexStringHashed = caver.klay.accounts.hashMessage(caver.utils.utf8ToHex('Hello World'))
        expect(rawStringHashed).to.equal(hexStringHashed)
    })

    it('CAVERJS-UNIT-ETC-004 : should have same value with caver.utils.sha3 containing prefix message', () => {
        const caver = new Caver(testRPCURL)

        const rawMessage = 'Hello World'
        const rawStringHashed = caver.klay.accounts.hashMessage(rawMessage)
        const sha3StringHashed = caver.utils.sha3(`\x19Klaytn Signed Message:\n${rawMessage.length}${rawMessage}`)

        expect(rawStringHashed).to.equal(sha3StringHashed)
    })
})
