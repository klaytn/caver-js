/*
    Copyright 2020 The caver-js Authors
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

const testRPCURL = require('./testrpc')

const Caver = require('../index')

let caver

const abi = [
    {
        constant: true,
        inputs: [],
        name: 'count',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'getBlockNumber',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'addr',
        outputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_str',
                type: 'bytes32',
            },
        ],
        name: 'setAddress',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_count',
                type: 'uint256',
            },
        ],
        name: 'setCount',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
]

describe('caver.contract with setWallet', () => {
    before(() => {
        caver = new Caver(testRPCURL)
    })

    it('CAVERJS-UNIT-ETC-255: setWallet function will replace _wallet in contract instance', async () => {
        const contract = new caver.contract(abi)
        const keyringContainer = new caver.wallet.constructor()
        keyringContainer.add(caver.wallet.keyring.generate())
        contract.setWallet(keyringContainer)
        expect(contract._wallet.length).to.equal(1)
    }).timeout(200000)

    it('CAVERJS-UNIT-ETC-256: clone function will clone contract instance with _wallet', async () => {
        const contract = new caver.contract(abi)
        const keyringContainer = new caver.wallet.constructor()
        keyringContainer.add(caver.wallet.keyring.generate())
        contract.setWallet(keyringContainer)

        const cloned = contract.clone()
        expect(cloned._wallet.length).to.equal(1)
    }).timeout(200000)
})

describe('caver.kct.kip7 with setWallet', () => {
    before(() => {
        caver = new Caver(testRPCURL)
    })

    it('CAVERJS-UNIT-ETC-257: setWallet function will replace _wallet in kip7 instance', async () => {
        const contract = new caver.kct.kip7('0x4f4e0d2489e528935285009f9c79b76c04828744')
        const keyringContainer = new caver.wallet.constructor()
        keyringContainer.add(caver.wallet.keyring.generate())
        contract.setWallet(keyringContainer)
        expect(contract._wallet.length).to.equal(1)
    }).timeout(200000)

    it('CAVERJS-UNIT-ETC-258: clone function will clone kip7 instance with _wallet', async () => {
        const contract = new caver.kct.kip7('0x4f4e0d2489e528935285009f9c79b76c04828744')
        const keyringContainer = new caver.wallet.constructor()
        keyringContainer.add(caver.wallet.keyring.generate())
        contract.setWallet(keyringContainer)

        const cloned = contract.clone()
        expect(cloned._wallet.length).to.equal(1)
    }).timeout(200000)
})

describe('caver.kct.kip17 with setWallet', () => {
    before(() => {
        caver = new Caver(testRPCURL)
    })

    it('CAVERJS-UNIT-ETC-259: setWallet function will replace _wallet in kip17 instance', async () => {
        const contract = new caver.kct.kip17('0x4f4e0d2489e528935285009f9c79b76c04828744')
        const keyringContainer = new caver.wallet.constructor()
        keyringContainer.add(caver.wallet.keyring.generate())
        contract.setWallet(keyringContainer)
        expect(contract._wallet.length).to.equal(1)
    }).timeout(200000)

    it('CAVERJS-UNIT-ETC-260: clone function will clone kip17 instance with _wallet', async () => {
        const contract = new caver.kct.kip17('0x4f4e0d2489e528935285009f9c79b76c04828744')
        const keyringContainer = new caver.wallet.constructor()
        keyringContainer.add(caver.wallet.keyring.generate())
        contract.setWallet(keyringContainer)

        const cloned = contract.clone()
        expect(cloned._wallet.length).to.equal(1)
    }).timeout(200000)
})
