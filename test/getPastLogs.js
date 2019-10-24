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

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

describe('getPastLogs', done => {
    it('should contain id and removed field', async () => {
        const caver = new Caver(testRPCURL)

        caver.klay.getPastLogs({
            fromBlock: '0x0',
            address: '0x9aa91c689248b0111dc756d7d505af4c2ff6be1b',
        })
    })

    it('should not throw an error with number type `fromBlock`', async () => {
        const caver = new Caver(testRPCURL)

        caver.klay.getPastLogs({
            fromBlock: 1,
            address: '0x9aa91c689248b0111dc756d7d505af4c2ff6be1b',
        })
    })

    it('should not throw an error with number type `toBlock`', async () => {
        const caver = new Caver(testRPCURL)

        caver.klay.getPastLogs({
            toBlock: 1000,
            address: '0x9aa91c689248b0111dc756d7d505af4c2ff6be1b',
        })
    }).timeout(100000)
})
