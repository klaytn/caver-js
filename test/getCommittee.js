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

describe('getCommittee from Node', () => {
    it('should throw an error on "pending" tag', done => {
        caver.klay
            .getCommittee('pending')
            .then(() => done(false))
            .catch(() => done())
    })

    it('committee should not be an empty on "latest" tag', async () => {
        const committee = await caver.klay.getCommittee('latest')
        expect(committee).not.to.be.empty
    })

    it('committee should not be an empty on "earliest" tag', async () => {
        const committee = await caver.klay.getCommittee('earliest')
        expect(committee).not.to.be.empty
    })

    it('committee should not be an empty on "genesis" tag', async () => {
        const committee = await caver.klay.getCommittee('genesis')
        expect(committee).not.to.be.empty
    })

    it('could be called without parameters', async () => {
        const committee = await caver.klay.getCommittee()
        expect(committee).not.to.be.empty
    })
})
