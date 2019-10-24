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

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

const abi = [
    {
        type: 'function',
        name: 'foo',
        inputs: [{ name: 'a', type: 'uint256' }],
        outputs: [{ name: 'b', type: 'address' }],
    },
    {
        type: 'event',
        name: 'Event',
        inputs: [{ name: 'a', type: 'uint256', indexed: true }, { name: 'b', type: 'bytes32', indexed: false }],
    },
]

describe('defaultBlock value should be set with valid value', done => {
    it('Set with valid value', async () => {
        expect((caver.klay.defaultBlock = '1000')).to.exist
    })

    it('Set with invalid value 1', async () => {
        expect(() => (caver.klay.defaultBlock = 'zzzzzz')).to.throw('Invalid default block number.')
    })

    it('Set with invalid value 2', async () => {
        expect(() => (caver.klay.defaultBlock = '0xzzzzzz')).to.throw('Invalid default block number.')
    })

    it('Set with invalid value in contract', async () => {
        const { address } = caver.klay.accounts.create()
        const contract = new caver.klay.Contract(abi, address)
        expect(() => (contract.defaultBlock = '0xzzzzzz')).to.throw('Invalid default block number.')
    })

    it('Set with invalid value in personal', async () => {
        expect(() => (caver.klay.personal.defaultBlock = '0xzzzzzz')).to.throw('Invalid default block number.')
    })
})
