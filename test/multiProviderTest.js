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
    it('For each provider, the request must be processed using its own requestManager.', async () => {
        const baobab_genesis = await baobab.klay.getBlock(0)
        const baobab_networkId = await baobab.klay.net.getId()
        const baobab_chainId = await baobab.klay.accounts._klaytnCall.getChainId()
        const baobab_networkType = await baobab.klay.net.getNetworkType()

        const cypress_genesis = await cypress.klay.getBlock(0)
        const cypress_networkId = await cypress.klay.net.getId()
        const cypress_chainId = await cypress.klay.accounts._klaytnCall.getChainId()
        const cypress_networkType = await cypress.klay.net.getNetworkType()

        expect(baobab_genesis.hash).to.not.equals(cypress_genesis.hash)

        expect(baobab_networkId).to.not.equals(cypress_networkId)
        expect(baobab_networkId).to.equals(1001)
        expect(cypress_networkId).to.equals(8217)

        expect(baobab_chainId).to.not.equals(cypress_chainId)
        expect(baobab_chainId).to.equals(1001)
        expect(cypress_chainId).to.equals(8217)

        expect(baobab_networkType).to.not.equals(cypress_networkType)
        expect(baobab_networkType).to.equals('baobab')
        expect(cypress_networkType).to.equals('cypress')
    }).timeout(10000)
  })