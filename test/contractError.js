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

describe('caver.contract error handling', () => {
    before(() => {
        caver = new Caver(testRPCURL)
    })

    it('CAVERJS-UNIT-ETC-254: contract.deploy throw error when data is not defined', async () => {
        const contract = new caver.contract(abi)
        expect(() => contract.deploy({})).to.throw('No "data" specified in neither the given options, nor the default options.')
    }).timeout(200000)
})
