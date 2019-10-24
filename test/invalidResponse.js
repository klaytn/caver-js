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

const assert = require('assert')
const { expect } = require('./extendedChai')
const Caver = require('../index')

let caver

describe('Connection error test', () => {
    it('CAVERJS-UNIT-ETC-051: host url is invalid, return connection error.', async () => {
        caver = new Caver(new Caver.providers.HttpProvider('invalid:1234', { timeout: 5000 }))
        try {
            await caver.klay.getNodeInfo()
            assert(false)
        } catch (err) {
            expect(err.message).to.equals("CONNECTION ERROR: Couldn't connect to node invalid:1234.")
        }
    }).timeout(10000)
})

describe('Invalid response test', () => {
    it('CAVERJS-UNIT-ETC-052: without timeout return Invalid response: null error.', async () => {
        caver = new Caver('http://localhost:1234/')
        try {
            await caver.klay.getNodeInfo()
            assert(false)
        } catch (err) {
            expect(err.message).to.equals('Invalid response: null')
        }
    })

    it('CAVERJS-UNIT-ETC-053: with timeout return Invalid response: null error.', async () => {
        caver = new Caver(new Caver.providers.HttpProvider('http://localhost:1234/', { timeout: 5000 }))
        try {
            await caver.klay.getNodeInfo()
            assert(false)
        } catch (err) {
            expect(err.message).to.equals('Invalid response: null')
        }
    })
})
