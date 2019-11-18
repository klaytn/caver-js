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

require('it-each')({ testPerIteration: true })
const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')
const websocketURL = require('./testWebsocket')

const Caver = require('../index.js')

describe('supportsSubscriptions from Providers', () => {
    it('CAVERJS-UNIT-ETC-095: HttpProvider should return false', () => {
        const caver = new Caver(testRPCURL)
        expect(caver.klay.currentProvider.supportsSubscriptions()).to.be.false
    })

    it('CAVERJS-UNIT-ETC-096: WebSocketProvider should return true', () => {
        const caver = new Caver(websocketURL)
        expect(caver.klay.currentProvider.supportsSubscriptions()).to.be.true
        caver.currentProvider.connection.close()
    })
})
