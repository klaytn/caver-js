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
const BN = require('bn.js')
const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

describe('sha3', done => {
    it('CAVERJS-UNIT-ETC-010, CAVERJS-UNIT-ETC-011, CAVERJS-UNIT-ETC-012 : should not throw an error when argument is number type', async () => {
        const caver = new Caver(testRPCURL)

        expect(() => caver.utils.sha3(234)).not.to.throw()

        expect(() => caver.utils.sha3(0xea)).not.to.throw()

        expect(() => caver.utils.sha3(new BN('234'))).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-013, CAVERJS-UNIT-ETC-014 : should return null when argument is number type', async () => {
        const caver = new Caver(testRPCURL)

        expect(caver.utils.sha3(234)).to.equal(null)

        expect(caver.utils.sha3(0xea)).to.equal(null)
    })

    it('CAVERJS-UNIT-ETC-015 : sha3(number string) should return same result with sha3(bignumber instance)', async () => {
        const caver = new Caver(testRPCURL)

        expect(caver.utils.sha3('234')).to.equal(caver.utils.sha3(new BN('234')))
    })
})

describe('klay.sha3', () => {
    it('should not throw an error when argument is number type', async () => {
        const caver = new Caver(testRPCURL)

        const ret = await caver.klay.sha3('0xea')
        expect(ret).to.equals('0x2f20677459120677484f7104c76deb6846a2c071f9b3152c103bb12cd54d1a4a')
    })
})
