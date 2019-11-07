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

describe('caver.klay.defaultAccount', () => {
    it('CAVERJS-UNIT-ETC-018 : defaultAccount should be null if not set', async () => {
        expect(caver.klay.defaultAccount).to.be.null
    })

    it('CAVERJS-UNIT-ETC-019 : defaultAccount should allow to set with valid non human readable address', async () => {
        expect(() => {
            caver.klay.defaultAccount = '0xa71e81e44588d96e2ae15b808e48b8d038b4477d'
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-020 : defaultAccount should return the configured non human readable address', async () => {
        const address = '0xa71e81e44588d96e2ae15b808e48b8d038b4477d'
        caver.klay.defaultAccount = address
        expect(caver.klay.defaultAccount.toLowerCase()).equals(address)
    })

    it('CAVERJS-UNIT-ETC-021 : defaultAccount should allow to set with valid human readable hex string address', async () => {
        expect(() => {
            caver.klay.defaultAccount = '0x6a61736d696e652e6b6c6179746e000000000000'
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-022 : defaultAccount should return hex address when defaultAccount is set with human readable hex address', async () => {
        const address = '0x6a61736d696e652e6b6c6179746e000000000000'
        caver.klay.defaultAccount = address
        expect(caver.klay.defaultAccount.toLowerCase()).equals(address)
    })

    it('CAVERJS-UNIT-ETC-025 : defaultAccount should not allow to set with invalid address', async () => {
        expect(() => {
            caver.klay.defaultAccount = 'invalid'
        }).to.throw()
    })
})
