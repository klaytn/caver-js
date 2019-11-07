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

require('it-each')({ testPerIteration: true })
const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

describe('getCommitteeSize from Node', () => {
    it('should throw an error on "pending" tag', done => {
        caver.klay
            .getCommitteeSize('pending')
            .then(() => done(false))
            .catch(() => done())
    })

    it('committeeSize should not be an empty on "latest" tag', async () => {
        const committeeSize = await caver.klay.getCommitteeSize('latest')
        expect(committeeSize).to.be.a('number')
    })

    it('committeeSize should not be an empty on "earliest" tag', async () => {
        const committeeSize = await caver.klay.getCommitteeSize('earliest')
        expect(committeeSize).to.be.a('number')
    })

    it('committeeSize should not be an empty on "genesis" tag', async () => {
        const committeeSize = await caver.klay.getCommitteeSize('genesis')
        expect(committeeSize).to.be.a('number')
    })

    it('could be called without parameters', async () => {
        const committeeSize = await caver.klay.getCommitteeSize()
        expect(committeeSize).to.be.a('number')
    })
})
