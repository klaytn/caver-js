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
const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

describe('get block', () => {
    it('should have specific property', async () => {
        const blockInfo = await caver.klay.getBlock(1)
        expect(blockInfo.receiptsRoot).to.exist
    })

    it('should return error when calling on non-existent block', done => {
        caver.klay.getBlockNumber().then(currentBlockNumber => {
            const queryBlockNumber = currentBlockNumber + 10000
            caver.klay
                .getBlock(queryBlockNumber)
                .then(() => {
                    done(false)
                })
                .catch(err => {
                    expect(err).to.be.null
                    done()
                })
        })
    })
})
