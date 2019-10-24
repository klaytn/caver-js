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

const Caver = require('../index.js')

describe('getNetworkType', () => {
    it('CAVERJS-UNIT-ETC-049: cypress mainnet should return "cypress"', async () => {
        const caver = new Caver('https://api.cypress.klaytn.net:8651/')
        const networkType = await caver.klay.net.getNetworkType()
        expect(networkType).to.equals('cypress')
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-050: baobab testnet should return "baobab"', async () => {
        const caver = new Caver('https://api.baobab.klaytn.net:8651/')
        const networkType = await caver.klay.net.getNetworkType()
        expect(networkType).to.equals('baobab')
    }).timeout(10000)
})
