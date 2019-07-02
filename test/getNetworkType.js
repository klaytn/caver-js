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

var Caver = require('../index.js')


describe('getNetworkType', () => {
    it('cypress mainnet should return "cypress"', async () => {
        const caver = new Caver('https://api.cypress.klaytn.net:8651/')
        const networkType = await caver.klay.net.getNetworkType()
        expect(networkType).to.equals('cypress')
    })

    it('baobab testnet should return "baobab"', async () => {
        const caver = new Caver('https://api.baobab.klaytn.net:8651/')
        const networkType = await caver.klay.net.getNetworkType()
        expect(networkType).to.equals('baobab')
    })
})
