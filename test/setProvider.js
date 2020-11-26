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

const host1 = 'http://random1.test.host:8551/'
const host2 = 'https://random2.test.host:8651/'
const host1Provider = new Caver.providers.HttpProvider(host1)
const host2Provider = new Caver.providers.HttpProvider(host2)

const abi = [
    {
        constant: false,
        inputs: [],
        name: 'say',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: 'who',
                type: 'address',
            },
        ],
        name: 'callevent',
        type: 'event',
    },
]

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
        const caver = new Caver(host1)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-168: When passing provider as a parameter through a Caver contructor, the provider must be set.', () => {
        const caver = new Caver(host1Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-169: When setting a provider with setProvider function, the currentProvider must be set appropriately.', () => {
        const caver = new Caver()
        caver.klay.setProvider(host1Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-170: If provider is set already, currentProvider must change when new provider is set with setProvider function.', () => {
        const caver = new Caver()
        caver.klay.setProvider(host1Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)

        caver.klay.setProvider(host2Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host2)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host2)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host2)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host2)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host2)
    }).timeout(10000)
})

describe('Test caver.setProvider', () => {
    it('CAVERJS-UNIT-ETC-215: If provider is not set, currentProvider must be null.', () => {
        const caver = new Caver()
        const contract = new caver.contract(abi)
        const kip7 = new caver.kct.kip7()
        const kip17 = new caver.kct.kip17()

        expect(caver.klay.currentProvider).to.be.null
        expect(caver.klay.net.currentProvider).to.be.null
        expect(caver.klay.personal.currentProvider).to.be.null
        expect(caver.klay.Contract.currentProvider).to.be.null
        expect(caver.klay.accounts.currentProvider).to.be.null
        expect(contract.currentProvider).to.be.null
        expect(kip7.currentProvider).to.be.null
        expect(kip17.currentProvider).to.be.null
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-216: When passing host information as a parameter through a Caver contructor, the provider must be set.', () => {
        const caver = new Caver(host1)
        const contract = new caver.contract(abi)
        const kip7 = new caver.kct.kip7()
        const kip17 = new caver.kct.kip17()

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)
        expect(contract.currentProvider).not.to.be.null
        expect(contract.currentProvider.host).to.equals(host1)
        expect(kip7.currentProvider).not.to.be.null
        expect(kip7.currentProvider.host).to.equals(host1)
        expect(kip17.currentProvider).not.to.be.null
        expect(kip17.currentProvider.host).to.equals(host1)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-217: When passing provider as a parameter through a Caver contructor, the provider must be set.', () => {
        const caver = new Caver(host1Provider)
        const contract = new caver.contract(abi)
        const kip7 = new caver.kct.kip7()
        const kip17 = new caver.kct.kip17()

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)
        expect(contract.currentProvider).not.to.be.null
        expect(contract.currentProvider.host).to.equals(host1)
        expect(kip7.currentProvider).not.to.be.null
        expect(kip7.currentProvider.host).to.equals(host1)
        expect(kip17.currentProvider).not.to.be.null
        expect(kip17.currentProvider.host).to.equals(host1)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-218: When setting a provider with setProvider function, the currentProvider must be set appropriately.', () => {
        const caver = new Caver()
        const contract = new caver.contract(abi)
        const kip7 = new caver.kct.kip7()
        const kip17 = new caver.kct.kip17()

        caver.setProvider(host1Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(contract.currentProvider).not.to.be.null
        expect(contract.currentProvider.host).to.equals(host1)
        expect(kip7.currentProvider).not.to.be.null
        expect(kip7.currentProvider.host).to.equals(host1)
        expect(kip17.currentProvider).not.to.be.null
        expect(kip17.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-219: If provider is set already, currentProvider must change when new provider is set with setProvider function.', () => {
        const caver = new Caver()
        const contract = new caver.contract(abi)
        const kip7 = new caver.kct.kip7()
        const kip17 = new caver.kct.kip17()

        caver.setProvider(host1Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host1)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host1)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host1)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host1)
        expect(contract.currentProvider).not.to.be.null
        expect(contract.currentProvider.host).to.equals(host1)
        expect(kip7.currentProvider).not.to.be.null
        expect(kip7.currentProvider.host).to.equals(host1)
        expect(kip17.currentProvider).not.to.be.null
        expect(kip17.currentProvider.host).to.equals(host1)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host1)

        caver.setProvider(host2Provider)

        expect(caver.klay.currentProvider).not.to.be.null
        expect(caver.klay.currentProvider.host).to.equals(host2)
        expect(caver.klay.net.currentProvider).not.to.be.null
        expect(caver.klay.net.currentProvider.host).to.equals(host2)
        expect(caver.klay.personal.currentProvider).not.to.be.null
        expect(caver.klay.personal.currentProvider.host).to.equals(host2)
        expect(caver.klay.Contract.currentProvider).not.to.be.null
        expect(caver.klay.Contract.currentProvider.host).to.equals(host2)
        expect(contract.currentProvider).not.to.be.null
        expect(contract.currentProvider.host).to.equals(host2)
        expect(kip7.currentProvider).not.to.be.null
        expect(kip7.currentProvider.host).to.equals(host2)
        expect(kip17.currentProvider).not.to.be.null
        expect(kip17.currentProvider.host).to.equals(host2)
        expect(caver.klay.accounts.currentProvider).not.to.be.null
        expect(caver.klay.accounts.currentProvider.host).to.equals(host2)
    }).timeout(10000)
})
