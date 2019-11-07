/*
    Copyright 2018 The caver-js Authors
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

const { expect } = require('chai')
const fetch = require('node-fetch')
const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const abi = [
    {
        constant: true,
        inputs: [],
        name: 'count',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'lastParticipant',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'plus', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    { constant: false, inputs: [], name: 'minus', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
]
const contractAddress = '0xbde8566f50b932189b76141f0a9ce029779cdb36'

describe('Instantiating Contract instance ', () => {
    it('CAVERJS-UNIT-TX-005 : Should throw an error with invalid `from` property', () => {
        const caver = new Caver(testRPCURL)

        const contractInstance = new caver.klay.Contract(abi, contractAddress)
        const invalidFromAddress = -1
        expect(() => (contractInstance.options.from = invalidFromAddress)).to.throw()

        const validFromAddress = -1
        expect(() => (contractInstance.options.from = '0xbde8566f50b932189b76141f0a9ce029779cdb36')).not.to.throw()
    })

    it('CAVERJS-UNIT-TX-006 : Should throw an error with invalid `gasPrice` property', () => {
        const caver = new Caver(testRPCURL)

        const contractInstance = new caver.klay.Contract(abi, contractAddress)

        const invalidGasPrice1 = -1
        const invalidGasPrice2 = 'zzzz'

        expect(() => (contractInstance.options.gasPrice = invalidGasPrice1)).to.throw()
        expect(() => (contractInstance.options.gasPrice = invalidGasPrice2)).to.throw()

        const validGasPrice1 = 1000
        const validGasPrice2 = '10000'
        const validGasPrice3 = '0x7530'

        expect(() => (contractInstance.options.gasPrice = validGasPrice1)).not.to.throw()
        expect(() => (contractInstance.options.gasPrice = validGasPrice2)).not.to.throw()
        expect(() => (contractInstance.options.gasPrice = validGasPrice3)).not.to.throw()
    })

    it('CAVERJS-UNIT-TX-007 : Should throw an error with invalid `gas` property', () => {
        const caver = new Caver(testRPCURL)

        const contractInstance = new caver.klay.Contract(abi, contractAddress)
        const invalidGas1 = -1
        const invalidGas2 = 'zzzz'

        expect(() => (contractInstance.options.gas = invalidGas1)).to.throw()
        expect(() => (contractInstance.options.gas = invalidGas2)).to.throw()

        const validGas1 = 3000
        const validGas2 = '30000'
        const validGas3 = '0x7530'

        expect(() => (contractInstance.options.gas = validGas1)).not.to.throw()
        expect(() => (contractInstance.options.gas = validGas2)).not.to.throw()
        expect(() => (contractInstance.options.gas = validGas3)).not.to.throw()
    })

    it('CAVERJS-UNIT-TX-008 : Should throw an error with invalid `data` property', () => {
        const caver = new Caver(testRPCURL)

        const contractInstance = new caver.klay.Contract(abi, contractAddress)
        const invalidData1 = -1
        const invalidData2 = 'zzzz'
        const invalidData3 = '0xz'
        const invalidData4 = '0xfz'

        expect(() => (contractInstance.options.data = invalidData1)).to.throw()
        expect(() => (contractInstance.options.data = invalidData2)).to.throw()
        expect(() => (contractInstance.options.data = invalidData3)).to.throw()
        expect(() => (contractInstance.options.data = invalidData4)).to.throw()

        const validData1 = '0xff'
        const validData2 = '0x030000'
        const validData3 = '0x7530'

        expect(() => (contractInstance.options.data = validData1)).not.to.throw()
        expect(() => (contractInstance.options.data = validData2)).not.to.throw()
        expect(() => (contractInstance.options.data = validData3)).not.to.throw()
    })
})
