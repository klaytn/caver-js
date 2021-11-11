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

const Caver = require('../index')
const testRPCURL = require('./testrpc')

describe('caver.contract', () => {
    it('CAVERJS-UNIT-ETC-261: If there are methods with the same number of parameters and different types among contract methods, the appropriate method for the parameter must be found and executed.', () => {
        const caver = new Caver(testRPCURL)
        const abi = [
            {
                constant: false,
                inputs: [{ name: '_id', type: 'uint256' }, { name: '_toList', type: 'address[]' }, { name: '_values', type: 'uint256[]' }],
                name: 'mint',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [{ name: '_id', type: 'uint256' }, { name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
                name: 'mint',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
        ]
        const contract = new caver.contract(abi)

        const mint = contract.methods.mint('0x0', '0xf1455798afca60c8d77824c949da1c6f2cbb04d6', '0x1')

        expect(mint._method.inputs[0].type).to.equal(abi[1].inputs[0].type)
        expect(mint._method.inputs[1].type).to.equal(abi[1].inputs[1].type)
        expect(mint._method.inputs[2].type).to.equal(abi[1].inputs[2].type)

        const mintWithArray = contract.methods.mint(
            '0x0',
            ['0xf1455798afca60c8d77824c949da1c6f2cbb04d6', '0xf455e1eee82086382fc43ff38363f390e4c5e548'],
            ['0x1', '0x0']
        )

        expect(mintWithArray._method.inputs[0].type).to.equal(abi[0].inputs[0].type)
        expect(mintWithArray._method.inputs[1].type).to.equal(abi[0].inputs[1].type)
        expect(mintWithArray._method.inputs[2].type).to.equal(abi[0].inputs[2].type)
    })
})
