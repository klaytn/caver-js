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

describe('MutatedInstance', () => {
    it('should be different method provider host', done => {
        const caver1 = new Caver('http://www.naver.com')

        const caver2 = new Caver(testRPCURL)

        expect(caver1.klay.getBlockNumber.method.requestManager.provider.host).to.not.eql(
            caver2.klay.getBlockNumber.method.requestManager.provider.host
        )
        done()
    })

    it('should be different method provider object', done => {
        const caver1 = new Caver('http://www.naver.com')

        const caver2 = new Caver(testRPCURL)

        expect(caver1.klay.getBlockNumber.method.requestManager.provider).to.not.eql(
            caver2.klay.getBlockNumber.method.requestManager.provider
        )
        done()
    })
})
