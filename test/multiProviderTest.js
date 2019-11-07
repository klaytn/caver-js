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

const Caver = require('../index')
const { expect } = require('./extendedChai')

const baobab = new Caver('https://api.baobab.klaytn.net:8651/')
const cypress = new Caver('https://api.cypress.klaytn.net:8651/')

describe('Test multi provider', () => {
    it('CAVERJS-UNIT-ETC-077: For each provider, the request must be processed using its own requestManager.', async () => {
        const baobabGenesis = await baobab.klay.getBlock(0)
        const baobabNetworkId = await baobab.klay.net.getId()
        const baobabChainId = await baobab.klay.accounts._klaytnCall.getChainId()
        const baobabNetworkType = await baobab.klay.net.getNetworkType()

        const cypressGenesis = await cypress.klay.getBlock(0)
        const cypressNetworkId = await cypress.klay.net.getId()
        const cypressChainId = await cypress.klay.accounts._klaytnCall.getChainId()
        const cypressNetworkType = await cypress.klay.net.getNetworkType()

        expect(baobabGenesis.hash).to.not.equals(cypressGenesis.hash)

        expect(baobabNetworkId).to.not.equals(cypressNetworkId)
        expect(baobabNetworkId).to.equals(1001)
        expect(cypressNetworkId).to.equals(8217)

        expect(baobabChainId).to.not.equals(cypressChainId)
        expect(baobabChainId).to.equals(1001)
        expect(cypressChainId).to.equals(8217)

        expect(baobabNetworkType).to.not.equals(cypressNetworkType)
        expect(baobabNetworkType).to.equals('baobab')
        expect(cypressNetworkType).to.equals('cypress')
    }).timeout(10000)
})
