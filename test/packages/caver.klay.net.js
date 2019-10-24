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

const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const Caver = require('../../index.js')

let caver
beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('CAVERJS-UNIT-ETC-044: caver.klay.net.getId', () => {
    context('input: no parameter', () => {
        it('should return networkId set in setting.js', async () => {
            const networkId = await caver.klay.net.getId()
            expect(networkId).to.be.a('number')
        })
    })

    context('input: callback', () => {
        it('should return networkId set in setting.js', done => {
            caver.klay.net.getId((err, data) => {
                const networkId = data
                expect(networkId).to.be.a('number')
                done()
            })
        })
    })
})

describe('CAVERJS-UNIT-ETC-045: caver.klay.net.isListening', () => {
    context('input: no parameter', () => {
        it('should return boolean type', async () => {
            const isListening = await caver.klay.net.isListening()
            expect(isListening).to.be.a('boolean')
        })
    })

    context('input: callback', () => {
        it('should return boolean type', async () => {
            const isListening = await caver.klay.net.isListening()
            expect(isListening).to.be.a('boolean')
        })
    })
})

describe('CAVERJS-UNIT-ETC-046: caver.klay.net.getPeerCount', () => {
    context('input: no parameter', () => {
        it('should return peerCount set in setting.js', async () => {
            const peerCount = await caver.klay.net.getPeerCount()
            expect(peerCount).to.be.a('number')
            expect(peerCount).not.to.be.equal(0)
        })
    })
})

describe('CAVERJS-UNIT-ETC-047: caver.klay.net.peerCountByType', () => {
    context('input: no parameter', () => {
        it('should return peerCount with type', async () => {
            const peerCountByType = await caver.klay.net.peerCountByType()

            expect(peerCountByType.total).not.to.be.undefined
            expect(typeof peerCountByType.total).to.equals('number')
        })
    })
})
