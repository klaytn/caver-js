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

describe('CAVERJS-UNIT-ETC-017 : unit map', done => {
    it('unit map should have `klay` property', async () => {
        const caver = new Caver(testRPCURL)

        expect(caver.utils.unitMap).to.have.property('KLAY')
    })

    it('fromPeb can receive number type parameter', () => {
        const caver = new Caver(testRPCURL)
        expect(() => caver.utils.fromPeb(1000)).not.to.throw()
    })

    it('toPeb can receive number type parameter', () => {
        const caver = new Caver(testRPCURL)
        expect(() => caver.utils.toPeb(1)).not.to.throw()
    })

    it('unitmap should have correct mapping', () => {
        const caver = new Caver(testRPCURL)
        /*
            Peb      = 1    // official notation 'peb'
            Kpeb     = 1e3  // official notation 'kpeb'
            Mpeb     = 1e6  // same
            Gpeb     = 1e9  // same
            Ston     = 1e9  // official notation 'ston'
            UKLAY    = 1e12 // official notation 'uKLAY'
            mKLAY    = 1e15 // official notation 'mKLAY'
            KLAY     = 1e18 // same
            KKLAY    = 1e21 // official notation 'kKLAY'
            MKLAY    = 1e24 // same
            GKLAY    = 1e27 // same
        */
        expect(caver.utils.unitMap.peb.length).to.equal(1)
        expect(caver.utils.unitMap.kpeb.length).to.equal(3 + 1)
        expect(caver.utils.unitMap.Mpeb.length).to.equal(6 + 1)
        expect(caver.utils.unitMap.Gpeb.length).to.equal(9 + 1)
        expect(caver.utils.unitMap.Ston.length).to.equal(9 + 1)
        expect(caver.utils.unitMap.uKLAY.length).to.equal(12 + 1)
        expect(caver.utils.unitMap.mKLAY.length).to.equal(15 + 1)
        expect(caver.utils.unitMap.KLAY.length).to.equal(18 + 1)
        expect(caver.utils.unitMap.kKLAY.length).to.equal(21 + 1)
        expect(caver.utils.unitMap.MKLAY.length).to.equal(24 + 1)
        expect(caver.utils.unitMap.GKLAY.length).to.equal(27 + 1)
    })
})
