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

const baobabHost = 'https://api.baobab.klaytn.net:8651/'
const cypressHost = 'https://api.cypress.klaytn.net:8651/'
const baobabProvider = new Caver.providers.HttpProvider(baobabHost)
const cypressProvider = new Caver.providers.HttpProvider(cypressHost)

describe('Test setProvider', () => {
    it('CAVERJS-UNIT-ETC-166: If provider is not set, currentProvider must be null.', () => {
        const caver = new Caver()

        expect(caver.klay.currentProvider).to.be.null
        expect(caver.klay.net.currentProvider).to.be.null
        expect(caver.klay.personal.currentProvider).to.be.null
        expect(caver.klay.Contract.currentProvider).to.be.null
        expect(caver.klay.accounts.currentProvider).to.be.null
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-167: When passing host information as a parameter through a Caver contructor, the provider must be set.', () => {
        const caver = new Caver(baobabHost)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(baobabHost)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-168: When passing provider as a parameter through a Caver contructor, the provider must be set.', () => {
        const caver = new Caver(baobabProvider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(baobabHost)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-169: When setting a provider with setProvider function, the currentProvider must be set appropriately.', () => {
        const caver = new Caver()
        caver.klay.setProvider(baobabProvider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(baobabHost)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-170: If provider is set already, currentProvider must change when new provider is set with setProvider function.', () => {
        const caver = new Caver()
        caver.klay.setProvider(baobabProvider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(baobabHost)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(baobabHost)

        caver.klay.setProvider(cypressProvider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(cypressHost)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(cypressHost)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(cypressHost)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(cypressHost)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(cypressHost)
    }).timeout(10000)
})
