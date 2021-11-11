/*
    Copyright 2021 The caver-js Authors
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
const { kip7JsonInterface, kip17JsonInterface, kip37JsonInterface } = require('../packages/caver-kct/src/kctHelper')

let caver

const abi = [
    {
        constant: true,
        inputs: [{ name: 'key', type: 'string' }],
        name: 'get',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }],
        name: 'set',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'getFirstValue',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
]

describe('decode function call string with various smart contracts', () => {
    before(() => {
        caver = new Caver(testRPCURL)
    })

    it('CAVERJS-UNIT-ETC-371: contract.decodeFunctionCall with params', () => {
        const contract = caver.contract.create(abi)

        const params = ['keyString', 'valueString']
        const encodedString = caver.abi.encodeFunctionCall(abi[1], params)
        const result = contract.decodeFunctionCall(encodedString)

        expect(params.length).to.equal(result.__length__)
        expect(params[0]).to.equal(result[0])
        expect(params[1]).to.equal(result[1])
    })

    it('CAVERJS-UNIT-ETC-372: contract.decodeFunctionCall without params', () => {
        const contract = caver.contract.create(abi)

        const encodedString = caver.abi.encodeFunctionCall(abi[2])
        const result = contract.decodeFunctionCall(encodedString)

        expect(result.__length__).to.equal(0)
    })

    it('CAVERJS-UNIT-ETC-373: kip7.decodeFunctionCall with params', () => {
        const kip7 = caver.kct.kip7.create()

        let transferFromABI
        for (const a of kip7JsonInterface) {
            if (a.name === 'transferFrom') transferFromABI = a
        }
        const params = ['0xff3fa88510da46b1a43181534ea998903cbd9127', '0xb7da2419482f8b9d530134464aca1ae64944691c', 600]
        const encodedString = caver.abi.encodeFunctionCall(transferFromABI, params)
        const result = kip7.decodeFunctionCall(encodedString)

        expect(params.length).to.equal(result.__length__)
        expect(params[0]).to.equal(result[0].toLowerCase())
        expect(params[1]).to.equal(result[1].toLowerCase())
        expect(params[2]).to.equal(parseInt(result[2]))
    })

    it('CAVERJS-UNIT-ETC-374: kip7.decodeFunctionCall without params', () => {
        const kip7 = caver.kct.kip7.create()

        let nameABI
        for (const a of kip7JsonInterface) {
            if (a.name === 'name') nameABI = a
        }
        const encodedString = caver.abi.encodeFunctionCall(nameABI)
        const result = kip7.decodeFunctionCall(encodedString)

        expect(result.__length__).to.equal(0)
    })

    it('CAVERJS-UNIT-ETC-375: kip17.decodeFunctionCall with params', () => {
        const kip17 = caver.kct.kip17.create()

        let transferFromABI
        for (const a of kip17JsonInterface) {
            if (a.name === 'transferFrom') transferFromABI = a
        }
        const params = ['0xff3fa88510da46b1a43181534ea998903cbd9127', '0xb7da2419482f8b9d530134464aca1ae64944691c', 600]
        const encodedString = caver.abi.encodeFunctionCall(transferFromABI, params)
        const result = kip17.decodeFunctionCall(encodedString)

        expect(params.length).to.equal(result.__length__)
        expect(params[0]).to.equal(result[0].toLowerCase())
        expect(params[1]).to.equal(result[1].toLowerCase())
        expect(params[2]).to.equal(parseInt(result[2]))
    })

    it('CAVERJS-UNIT-ETC-376: kip17.decodeFunctionCall without params', () => {
        const kip17 = caver.kct.kip17.create()

        let nameABI
        for (const a of kip17JsonInterface) {
            if (a.name === 'name') nameABI = a
        }
        const encodedString = caver.abi.encodeFunctionCall(nameABI)
        const result = kip17.decodeFunctionCall(encodedString)

        expect(result.__length__).to.equal(0)
    })

    it('CAVERJS-UNIT-ETC-377: kip37.decodeFunctionCall with params', () => {
        const kip37 = caver.kct.kip37.create()

        let safeTransferFromABI
        for (const a of kip37JsonInterface) {
            if (a.name === 'safeTransferFrom') safeTransferFromABI = a
        }
        const params = ['0xff3fa88510da46b1a43181534ea998903cbd9127', '0xb7da2419482f8b9d530134464aca1ae64944691c', 1, 600, Buffer.from('')]
        const encodedString = caver.abi.encodeFunctionCall(safeTransferFromABI, params)
        const result = kip37.decodeFunctionCall(encodedString)

        expect(params.length).to.equal(result.__length__)
        expect(params[0]).to.equal(result[0].toLowerCase())
        expect(params[1]).to.equal(result[1].toLowerCase())
        expect(params[2]).to.equal(parseInt(result[2]))
        expect(params[3]).to.equal(parseInt(result[3]))
        expect(Buffer.compare(params[4], caver.utils.toBuffer(result[4]))).to.equal(0)
    })

    it('CAVERJS-UNIT-ETC-378: kip37.decodeFunctionCall without params', () => {
        const kip37 = caver.kct.kip37.create()

        let pausedABI
        for (const a of kip37JsonInterface) {
            if (a.name === 'paused') pausedABI = a
        }
        const encodedString = caver.abi.encodeFunctionCall(pausedABI)
        const result = kip37.decodeFunctionCall(encodedString)

        expect(result.__length__).to.equal(0)
    })
})
